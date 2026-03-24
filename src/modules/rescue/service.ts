import { FastifyRequest } from "fastify";
import { Op } from "sequelize";
import { Rescue } from "../../db/models/rescue/rescue.model";
import { RescueImage } from "../../db/models/rescue/rescue-image.model";
import { RescuePerson } from "../../db/models/rescue/rescue-person.model";
import { User } from "../../db/models/auth/user.model";
import { CreateRescueBodySchema } from "./dto";
import { success, error } from "../../shared/http/response";
import { HttpStatus } from "../../shared/http/status";
import { getPagination, getPaginationMeta } from "../../shared/utils/pagination";
import { sequelize } from "../../db";
import { uploadMultipleFiles, UploadError } from "../../middleware/fileUpload";

export async function createRescue(req: FastifyRequest) {
  try {
    const { files: uploadedFiles, fields } = await uploadMultipleFiles(req, {
      subDir: "rescues",
      prefix: "rescue",
      allowedMimes: ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"],
      maxSize: 100 * 1024 * 1024,
      maxFiles: 10,
    });

    if (uploadedFiles.length === 0) {
      return error(HttpStatus.BAD_REQUEST, "At least 1 image or video is required");
    }

    // Parse body fields through Zod
    const parseResult = CreateRescueBodySchema.safeParse(fields);
    if (!parseResult.success) {
      const message = parseResult.error.errors
        .map((e) => `${e.path.join(".")} ${e.message}`)
        .join(", ");
      return error(HttpStatus.BAD_REQUEST, message);
    }

    const data = parseResult.data;

    const transaction = await sequelize.transaction();

    try {
      const rescue = await Rescue.create(
        {
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
          created_by: req.userId!,
        },
        { transaction }
      );

      // Create rescue images/videos
      const imageRecords = uploadedFiles.map((file, index) => ({
        rescue_id: rescue.id,
        image_url: file.url,
        media_type: file.mimetype.startsWith("video/") ? "video" : "image",
        sort_order: index,
      }));
      await RescueImage.bulkCreate(imageRecords, { transaction });

      // Create rescue persons
      const rescuePersonIds = data.rescue_person_ids as number[] | undefined;
      if (rescuePersonIds && rescuePersonIds.length > 0) {
        const personRecords = rescuePersonIds.map((userId) => ({
          rescue_id: rescue.id,
          user_id: userId,
        }));
        await RescuePerson.bulkCreate(personRecords, { transaction });
      }

      await transaction.commit();

      return success("Rescue created successfully", { id: rescue.id }, HttpStatus.CREATED);
    } catch (txErr) {
      await transaction.rollback();
      throw txErr;
    }
  } catch (err: any) {
    if (err instanceof UploadError) {
      return error(err.statusCode, err.message);
    }
    return error(HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to create rescue");
  }
}

export async function listRescues(req: FastifyRequest) {
  try {
    const params = req.query as { page: number; limit: number; status?: string; animal_type?: string; search?: string; date_from?: string; date_to?: string };
    const { offset, limit } = getPagination(params);

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.animal_type) where.animal_type = { [Op.iLike]: `%${params.animal_type}%` };
    if (params.search) {
      where[Op.or] = [
        { animal_type: { [Op.iLike]: `%${params.search}%` } },
        { info_provider_name: { [Op.iLike]: `%${params.search}%` } },
        { from_address: { [Op.iLike]: `%${params.search}%` } },
        { to_address: { [Op.iLike]: `%${params.search}%` } },
      ];
    }
    if (params.date_from || params.date_to) {
      where.createdAt = {};
      if (params.date_from) where.createdAt[Op.gte] = new Date(params.date_from);
      if (params.date_to) where.createdAt[Op.lte] = new Date(params.date_to + "T23:59:59.999Z");
    }

    const { count, rows } = await Rescue.findAndCountAll({
      where,
      include: [
        {
          model: RescueImage,
          as: "images",
          attributes: ["id", "image_url", "media_type", "sort_order"],
          separate: true,
          order: [["sort_order", "ASC"]],
          limit: 1,
        },
        {
          model: RescuePerson,
          as: "rescue_persons",
          attributes: ["user_id"],
          include: [
            {
              model: User,
              attributes: ["id", "full_name", "profile_pic"],
            },
          ],
        },
        {
          model: User,
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
      ...success("Rescues fetched", rows),
      pagination: getPaginationMeta(count, params),
    };
  } catch (err: any) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to list rescues");
  }
}

export async function getRescueDetail(req: FastifyRequest) {
  try {
    const { id } = req.params as { id: number };
    const rescue = await Rescue.findByPk(id, {
      include: [
        {
          model: RescueImage,
          as: "images",
          attributes: ["id", "image_url", "media_type", "sort_order"],
          separate: true,
          order: [["sort_order", "ASC"]],
        },
        {
          model: RescuePerson,
          as: "rescue_persons",
          attributes: ["id", "user_id"],
          separate: true,
          include: [
            {
              model: User,
              attributes: ["id", "full_name", "mobile_number", "profile_pic"],
            },
          ],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "full_name", "username"],
        },
        {
          model: User,
          as: "info_provider",
          attributes: ["id", "full_name", "mobile_number"],
        },
      ],
    });

    if (!rescue) {
      return error(HttpStatus.NOT_FOUND, "Rescue not found");
    }

    return success("Rescue fetched", rescue);
  } catch (err: any) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to fetch rescue detail");
  }
}
