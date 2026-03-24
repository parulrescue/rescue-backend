import { FastifyRequest } from "fastify";
import { Animal } from "../../db/models/rescue/animal.model";
import { success, error } from "../../shared/http/response";
import { HttpStatus } from "../../shared/http/status";

export async function getAnimals(req: FastifyRequest) {
  try {
    const animals = await Animal.findAll({
      where: { is_active: true },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
      raw: true,
    });

    return success("Animals fetched", animals);
  } catch (err: any) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to fetch animals");
  }
}
