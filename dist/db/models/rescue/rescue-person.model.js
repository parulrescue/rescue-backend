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
exports.RescuePerson = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const rescue_model_1 = require("./rescue.model");
const user_model_1 = require("../auth/user.model");
let RescuePerson = class RescuePerson extends sequelize_typescript_1.Model {
    rescue_id;
    user_id;
    rescue;
    user;
};
exports.RescuePerson = RescuePerson;
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, autoIncrement: true, primaryKey: true }),
    __metadata("design:type", Number)
], RescuePerson.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => rescue_model_1.Rescue),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], RescuePerson.prototype, "rescue_id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.User),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Object)
], RescuePerson.prototype, "user_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => rescue_model_1.Rescue, { onDelete: "CASCADE" }),
    __metadata("design:type", rescue_model_1.Rescue)
], RescuePerson.prototype, "rescue", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.User, { onDelete: "SET NULL" }),
    __metadata("design:type", user_model_1.User)
], RescuePerson.prototype, "user", void 0);
exports.RescuePerson = RescuePerson = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "rescue_persons", timestamps: true })
], RescuePerson);
