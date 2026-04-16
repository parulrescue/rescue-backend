import { FastifyRequest } from "fastify";
import { Op } from "sequelize";
import { User } from "../../db/models/auth/user.model";
import { success, error } from "../../shared/http/response";
import { HttpStatus } from "../../shared/http/status";
import { getPagination, getPaginationMeta } from "../../shared/utils/pagination";
import { uploadSingleFile, deleteFile, UploadError } from "../../middleware/fileUpload";

export async function getProfile(req: FastifyRequest) {
  try {
    const user = await User.findByPk(req.userId!, {
      attributes: ["id", "full_name", "mobile_number", "username", "email", "profile_pic", "createdAt"],
      raw: true,
    });

    if (!user) {
      return error(HttpStatus.NOT_FOUND, "User not found");
    }

    return success("Profile fetched", user);
  } catch (err: any) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to fetch profile");
  }
}

export async function updateProfile(req: FastifyRequest) {
  try {
    const data = req.body as { full_name?: string; mobile_number?: string };
    const user = await User.findByPk(req.userId!);
    if (!user) {
      return error(HttpStatus.NOT_FOUND, "User not found");
    }

    if (data.mobile_number && data.mobile_number !== user.mobile_number) {
      const existing = await User.findOne({
        where: { mobile_number: data.mobile_number, id: { [Op.ne]: req.userId! } },
        raw: true,
      });
      if (existing) {
        return error(HttpStatus.CONFLICT, "Mobile number already in use");
      }
    }

    await user.update(data);

    return success("Profile updated", {
      id: user.id,
      full_name: user.full_name,
      mobile_number: user.mobile_number,
      username: user.username,
      email: user.email,
      profile_pic: user.profile_pic,
    });
  } catch (err: any) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to update profile");
  }
}

export async function updateAvatar(req: FastifyRequest) {
  try {
    const user = await User.findByPk(req.userId!);
    if (!user) {
      return error(HttpStatus.NOT_FOUND, "User not found");
    }

    const uploaded = await uploadSingleFile(req, {
      subDir: "profile_pic",
      prefix: `avatar_${req.userId}`,
      allowedMimes: ["image/jpeg", "image/png", "image/webp"],
      maxSize: 5 * 1024 * 1024,
    });

    // Delete old avatar if exists
    if (user.profile_pic) {
      deleteFile(user.profile_pic);
    }

    await user.update({ profile_pic: uploaded.url });

    return success("Avatar updated", { profile_pic: uploaded.url });
  } catch (err: any) {
    if (err instanceof UploadError) {
      return error(err.statusCode, err.message);
    }
    return error(HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to update avatar");
  }
}

export async function searchUsers(req: FastifyRequest) {
  try {
    const { q, page, limit } = req.query as { q: string; page: number; limit: number };
    const { offset, limit: take } = getPagination({ page, limit });

    const { count, rows } = await User.findAndCountAll({
      where: {
        is_active: true,
        [Op.or]: [
          { full_name: { [Op.like]: `%${q}%` } },
          { mobile_number: { [Op.like]: `%${q}%` } },
          { username: { [Op.like]: `%${q}%` } },
        ],
      },
      attributes: ["id", "full_name", "mobile_number", "username", "profile_pic"],
      offset,
      limit: take,
      order: [["full_name", "ASC"]],
      raw: true,
    });

    return {
      ...success("Users fetched", rows),
      pagination: getPaginationMeta(count, { page, limit }),
    };
  } catch (err: any) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to search users");
  }
}

export async function lookupUsers(req: FastifyRequest) {
  try {
    const { q } = req.query as { q: string };
    const users = await User.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          { full_name: { [Op.like]: `%${q}%` } },
          { mobile_number: { [Op.like]: `%${q}%` } },
        ],
      },
      attributes: ["id", "full_name", "mobile_number", "profile_pic"],
      limit: 10,
      order: [["full_name", "ASC"]],
      raw: true,
    });

    return success("Users fetched", users);
  } catch (err: any) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to lookup users");
  }
}
