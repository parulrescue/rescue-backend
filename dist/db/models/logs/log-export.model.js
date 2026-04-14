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
exports.LogExport = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
let LogExport = class LogExport extends sequelize_typescript_1.Model {
    environment;
    date;
    log_type;
    status;
    total_records;
    file_path;
    filters;
    exported_by;
    error_message;
};
exports.LogExport = LogExport;
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, defaultValue: sequelize_typescript_1.DataType.UUIDV4, primaryKey: true }),
    __metadata("design:type", String)
], LogExport.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50), allowNull: false }),
    __metadata("design:type", String)
], LogExport.prototype, "environment", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(10), allowNull: false }),
    __metadata("design:type", String)
], LogExport.prototype, "date", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.ENUM("INFO", "ERROR", "ALL"), allowNull: false, field: "log_type" }),
    __metadata("design:type", String)
], LogExport.prototype, "log_type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.ENUM("pending", "completed", "failed"), allowNull: false, defaultValue: "completed" }),
    __metadata("design:type", String)
], LogExport.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false, defaultValue: 0, field: "total_records" }),
    __metadata("design:type", Number)
], LogExport.prototype, "total_records", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true, field: "file_path" }),
    __metadata("design:type", Object)
], LogExport.prototype, "file_path", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.JSONB, allowNull: true }),
    __metadata("design:type", Object)
], LogExport.prototype, "filters", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(255), allowNull: true, field: "exported_by" }),
    __metadata("design:type", Object)
], LogExport.prototype, "exported_by", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true, field: "error_message" }),
    __metadata("design:type", Object)
], LogExport.prototype, "error_message", void 0);
exports.LogExport = LogExport = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "log_exports", timestamps: true })
], LogExport);
