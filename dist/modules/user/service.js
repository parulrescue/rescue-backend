"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.updateAvatar = updateAvatar;
exports.searchUsers = searchUsers;
exports.lookupUsers = lookupUsers;
const sequelize_1 = require("sequelize");
const user_model_1 = require("../../db/models/auth/user.model");
const response_1 = require("../../shared/http/response");
const status_1 = require("../../shared/http/status");
const pagination_1 = require("../../shared/utils/pagination");
const fileUpload_1 = require("../../middleware/fileUpload");
async function getProfile(req) {
    try {
        const user = await user_model_1.User.findByPk(req.userId, {
            attributes: ["id", "full_name", "mobile_number", "username", "email", "profile_pic", "createdAt"],
            raw: true,
        });
        if (!user) {
            return (0, response_1.error)(status_1.HttpStatus.NOT_FOUND, "User not found");
        }
        return (0, response_1.success)("Profile fetched", user);
    }
    catch (err) {
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to fetch profile");
    }
}
async function updateProfile(req) {
    try {
        const data = req.body;
        const user = await user_model_1.User.findByPk(req.userId);
        if (!user) {
            return (0, response_1.error)(status_1.HttpStatus.NOT_FOUND, "User not found");
        }
        if (data.mobile_number && data.mobile_number !== user.mobile_number) {
            const existing = await user_model_1.User.findOne({
                where: { mobile_number: data.mobile_number, id: { [sequelize_1.Op.ne]: req.userId } },
                raw: true,
            });
            if (existing) {
                return (0, response_1.error)(status_1.HttpStatus.CONFLICT, "Mobile number already in use");
            }
        }
        await user.update(data);
        return (0, response_1.success)("Profile updated", {
            id: user.id,
            full_name: user.full_name,
            mobile_number: user.mobile_number,
            username: user.username,
            email: user.email,
            profile_pic: user.profile_pic,
        });
    }
    catch (err) {
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to update profile");
    }
}
async function updateAvatar(req) {
    try {
        const user = await user_model_1.User.findByPk(req.userId);
        if (!user) {
            return (0, response_1.error)(status_1.HttpStatus.NOT_FOUND, "User not found");
        }
        const uploaded = await (0, fileUpload_1.uploadSingleFile)(req, {
            subDir: "profile_pic",
            prefix: `avatar_${req.userId}`,
            allowedMimes: ["image/jpeg", "image/png", "image/webp"],
            maxSize: 5 * 1024 * 1024,
        });
        // Delete old avatar if exists
        if (user.profile_pic) {
            (0, fileUpload_1.deleteFile)(user.profile_pic);
        }
        await user.update({ profile_pic: uploaded.url });
        return (0, response_1.success)("Avatar updated", { profile_pic: uploaded.url });
    }
    catch (err) {
        if (err instanceof fileUpload_1.UploadError) {
            return (0, response_1.error)(err.statusCode, err.message);
        }
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to update avatar");
    }
}
async function searchUsers(req) {
    try {
        const { q, page, limit } = req.query;
        const { offset, limit: take } = (0, pagination_1.getPagination)({ page, limit });
        const { count, rows } = await user_model_1.User.findAndCountAll({
            where: {
                is_active: true,
                [sequelize_1.Op.or]: [
                    { full_name: { [sequelize_1.Op.iLike]: `%${q}%` } },
                    { mobile_number: { [sequelize_1.Op.iLike]: `%${q}%` } },
                    { username: { [sequelize_1.Op.iLike]: `%${q}%` } },
                ],
            },
            attributes: ["id", "full_name", "mobile_number", "username", "profile_pic"],
            offset,
            limit: take,
            order: [["full_name", "ASC"]],
            raw: true,
        });
        return {
            ...(0, response_1.success)("Users fetched", rows),
            pagination: (0, pagination_1.getPaginationMeta)(count, { page, limit }),
        };
    }
    catch (err) {
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to search users");
    }
}
async function lookupUsers(req) {
    try {
        const { q } = req.query;
        const users = await user_model_1.User.findAll({
            where: {
                is_active: true,
                [sequelize_1.Op.or]: [
                    { full_name: { [sequelize_1.Op.iLike]: `%${q}%` } },
                    { mobile_number: { [sequelize_1.Op.iLike]: `%${q}%` } },
                ],
            },
            attributes: ["id", "full_name", "mobile_number", "profile_pic"],
            limit: 10,
            order: [["full_name", "ASC"]],
            raw: true,
        });
        return (0, response_1.success)("Users fetched", users);
    }
    catch (err) {
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to lookup users");
    }
}
