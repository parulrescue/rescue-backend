"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rescue = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_1 = require("../auth/user.model");
const rescue_image_model_1 = require("./rescue-image.model");
const rescue_person_model_1 = require("./rescue-person.model");
let Rescue = class Rescue extends sequelize_typescript_1.Model {
    animal_type;
    animal_description;
    info_provider_name;
    info_provider_number;
    info_provider_user_id;
    from_address;
    from_pincode;
    from_area;
    to_address;
    to_pincode;
    to_area;
    status;
    created_by;
    images;
    rescue_persons;
    creator;
    info_provider;
    persons;
};
exports.Rescue = Rescue;
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, autoIncrement: true, primaryKey: true }),
    __metadata("design:type", Number)
], Rescue.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(100), allowNull: false }),
    __metadata("design:type", String)
], Rescue.prototype, "animal_type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", Object)
], Rescue.prototype, "animal_description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(150), allowNull: false }),
    __metadata("design:type", String)
], Rescue.prototype, "info_provider_name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(15), allowNull: false }),
    __metadata("design:type", String)
], Rescue.prototype, "info_provider_number", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.User),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Object)
], Rescue.prototype, "info_provider_user_id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: false }),
    __metadata("design:type", String)
], Rescue.prototype, "from_address", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(10), allowNull: true }),
    __metadata("design:type", Object)
], Rescue.prototype, "from_pincode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(200), allowNull: true }),
    __metadata("design:type", Object)
], Rescue.prototype, "from_area", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: false }),
    __metadata("design:type", String)
], Rescue.prototype, "to_address", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(10), allowNull: true }),
    __metadata("design:type", Object)
], Rescue.prototype, "to_pincode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(200), allowNull: true }),
    __metadata("design:type", Object)
], Rescue.prototype, "to_area", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.ENUM("pending", "in_progress", "completed", "cancelled"), allowNull: false, defaultValue: "pending" }),
    __metadata("design:type", String)
], Rescue.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.User),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Object)
], Rescue.prototype, "created_by", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => rescue_image_model_1.RescueImage, { foreignKey: "rescue_id", onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], Rescue.prototype, "images", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => rescue_person_model_1.RescuePerson, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], Rescue.prototype, "rescue_persons", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.User, { foreignKey: "created_by", as: "creator" }),
    __metadata("design:type", user_model_1.User)
], Rescue.prototype, "creator", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.User, { foreignKey: "info_provider_user_id", as: "info_provider" }),
    __metadata("design:type", user_model_1.User)
], Rescue.prototype, "info_provider", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => user_model_1.User, () => rescue_person_model_1.RescuePerson),
    __metadata("design:type", Array)
], Rescue.prototype, "persons", void 0);
exports.Rescue = Rescue = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "rescues", timestamps: true })
], Rescue);
