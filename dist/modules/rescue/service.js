"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRescue = createRescue;
exports.listRescues = listRescues;
exports.getRescueDetail = getRescueDetail;
const sequelize_1 = require("sequelize");
const rescue_model_1 = require("../../db/models/rescue/rescue.model");
const rescue_image_model_1 = require("../../db/models/rescue/rescue-image.model");
const rescue_person_model_1 = require("../../db/models/rescue/rescue-person.model");
const user_model_1 = require("../../db/models/auth/user.model");
const dto_1 = require("./dto");
const response_1 = require("../../shared/http/response");
const status_1 = require("../../shared/http/status");
const pagination_1 = require("../../shared/utils/pagination");
const db_1 = require("../../db");
const fileUpload_1 = require("../../middleware/fileUpload");
async function createRescue(req) {
    try {
        const { files: uploadedFiles, fields } = await (0, fileUpload_1.uploadMultipleFiles)(req, {
            subDir: "rescues",
            prefix: "rescue",
            allowedMimes: ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"],
            maxSize: 100 * 1024 * 1024,
            maxFiles: 10,
        });
        if (uploadedFiles.length === 0) {
            return (0, response_1.error)(status_1.HttpStatus.BAD_REQUEST, "At least 1 image or video is required");
        }
        // Parse body fields through Zod
        const parseResult = dto_1.CreateRescueBodySchema.safeParse(fields);
        if (!parseResult.success) {
            const message = parseResult.error.errors
                .map((e) => `${e.path.join(".")} ${e.message}`)
                .join(", ");
            return (0, response_1.error)(status_1.HttpStatus.BAD_REQUEST, message);
        }
        const data = parseResult.data;
        const transaction = await db_1.sequelize.transaction();
        try {
            const rescue = await rescue_model_1.Rescue.create({
                animal_type: data.animal_type,
                animal_description: data.animal_description || null,
                info_provider_name: data.info_provider_name,
                info_provider_number: data.info_provider_number,
                info_provider_user_id: data.info_provider_user_id || null,
                from_address: data.from_address,
                from_pincode: data.from_pincode || null,
                from_area: data.from_area || null,
                to_address: data.to_address,
                to_pincode: data.to_pincode || null,
                to_area: data.to_area || null,
                status: "pending",
                created_by: req.userId,
            }, { transaction });
            // Create rescue images/videos
            const imageRecords = uploadedFiles.map((file, index) => ({
                rescue_id: rescue.id,
                image_url: file.url,
                media_type: file.mimetype.startsWith("video/") ? "video" : "image",
                sort_order: index,
            }));
            await rescue_image_model_1.RescueImage.bulkCreate(imageRecords, { transaction });
            // Create rescue persons
            const rescuePersonIds = data.rescue_person_ids;
            if (rescuePersonIds && rescuePersonIds.length > 0) {
                const personRecords = rescuePersonIds.map((userId) => ({
                    rescue_id: rescue.id,
                    user_id: userId,
                }));
                await rescue_person_model_1.RescuePerson.bulkCreate(personRecords, { transaction });
            }
            await transaction.commit();
            return (0, response_1.success)("Rescue created successfully", { id: rescue.id }, status_1.HttpStatus.CREATED);
        }
        catch (txErr) {
            await transaction.rollback();
            throw txErr;
        }
    }
    catch (err) {
        if (err instanceof fileUpload_1.UploadError) {
            return (0, response_1.error)(err.statusCode, err.message);
        }
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to create rescue");
    }
}
async function listRescues(req) {
    try {
        const params = req.query;
        const { offset, limit } = (0, pagination_1.getPagination)(params);
        const where = {};
        if (params.status)
            where.status = params.status;
        if (params.animal_type)
            where.animal_type = { [sequelize_1.Op.iLike]: `%${params.animal_type}%` };
        if (params.search) {
            where[sequelize_1.Op.or] = [
                { animal_type: { [sequelize_1.Op.iLike]: `%${params.search}%` } },
                { info_provider_name: { [sequelize_1.Op.iLike]: `%${params.search}%` } },
                { from_address: { [sequelize_1.Op.iLike]: `%${params.search}%` } },
                { to_address: { [sequelize_1.Op.iLike]: `%${params.search}%` } },
            ];
        }
        if (params.date_from || params.date_to) {
            where.createdAt = {};
            if (params.date_from)
                where.createdAt[sequelize_1.Op.gte] = new Date(params.date_from);
            if (params.date_to)
                where.createdAt[sequelize_1.Op.lte] = new Date(params.date_to + "T23:59:59.999Z");
        }
        const { count, rows } = await rescue_model_1.Rescue.findAndCountAll({
            where,
            include: [
                {
                    model: rescue_image_model_1.RescueImage,
                    as: "images",
                    attributes: ["id", "image_url", "media_type", "sort_order"],
                    separate: true,
                    order: [["sort_order", "ASC"]],
                    limit: 1,
                },
                {
                    model: rescue_person_model_1.RescuePerson,
                    as: "rescue_persons",
                    attributes: ["user_id"],
                    include: [
                        {
                            model: user_model_1.User,
                            attributes: ["id", "full_name", "profile_pic"],
                        },
                    ],
                },
                {
                    model: user_model_1.User,
                    as: "creator",
                    attributes: ["id", "full_name"],
                },
            ],
            attributes: [
                "id", "animal_type", "status", "from_address", "to_address",
                "info_provider_name", "createdAt",
            ],
            offset,
            limit,
            order: [["id", "DESC"]],
            distinct: true,
            raw: true,
            nest: true,
        });
        return {
            ...(0, response_1.success)("Rescues fetched", rows),
            pagination: (0, pagination_1.getPaginationMeta)(count, params),
        };
    }
    catch (err) {
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to list rescues");
    }
}
async function getRescueDetail(req) {
    try {
        const { id } = req.params;
        const rescue = await rescue_model_1.Rescue.findByPk(id, {
            include: [
                {
                    model: rescue_image_model_1.RescueImage,
                    as: "images",
                    attributes: ["id", "image_url", "media_type", "sort_order"],
                    separate: true,
                    order: [["sort_order", "ASC"]],
                },
                {
                    model: rescue_person_model_1.RescuePerson,
                    as: "rescue_persons",
                    attributes: ["id", "user_id"],
                    separate: true,
                    include: [
                        {
                            model: user_model_1.User,
                            attributes: ["id", "full_name", "mobile_number", "profile_pic"],
                        },
                    ],
                },
                {
                    model: user_model_1.User,
                    as: "creator",
                    attributes: ["id", "full_name", "username"],
                },
                {
                    model: user_model_1.User,
                    as: "info_provider",
                    attributes: ["id", "full_name", "mobile_number"],
                },
            ],
        });
        if (!rescue) {
            return (0, response_1.error)(status_1.HttpStatus.NOT_FOUND, "Rescue not found");
        }
        return (0, response_1.success)("Rescue fetched", rescue);
    }
    catch (err) {
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to fetch rescue detail");
    }
}
