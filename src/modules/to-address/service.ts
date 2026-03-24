import { ToAddress } from "../../db/models/rescue/to-address.model";
import { success, error } from "../../shared/http/response";
import { HttpStatus } from "../../shared/http/status";

export async function listActiveToAddresses() {
  try {
    const rows = await ToAddress.findAll({
      where: { is_active: true },
      attributes: ["id", "title", "address", "pincode", "area"],
      order: [["title", "ASC"]],
    });
    return success("To addresses fetched", rows);
  } catch (err: any) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch to addresses");
  }
}
