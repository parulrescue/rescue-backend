"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExportHistory = getExportHistory;
exports.getAvailableDates = getAvailableDates;
exports.getAvailableEnvironments = getAvailableEnvironments;
exports.filterLogs = filterLogs;
exports.convertToExcel = convertToExcel;
const fs_1 = require("fs");
const path_1 = require("path");
const exceljs_1 = __importDefault(require("exceljs"));
const config_1 = require("../../config");
const models_1 = require("../../db/models");
const response_1 = require("../../shared/http/response");
const status_1 = require("../../shared/http/status");
const LEVEL_MAP = {
    10: "TRACE",
    20: "DEBUG",
    30: "INFO",
    40: "WARN",
    50: "ERROR",
    60: "FATAL",
};
function parseLogLine(line) {
    try {
        const entry = JSON.parse(line);
        // Handle both nested and flat formats
        const timestamp = typeof entry.time === "string"
            ? entry.time
            : new Date(entry.time).toISOString();
        return {
            timestamp,
            level: LEVEL_MAP[entry.level] || "UNKNOWN",
            levelNum: entry.level,
            requestId: entry.reqId || entry.request_id || "",
            method: entry.method || entry.req?.method || "",
            url: entry.endpoint || entry.full_url || entry.req?.url || "",
            statusCode: entry.status_code ?? entry.code ?? entry.res?.statusCode ?? null,
            responseTime: entry.response_time_ms ?? entry.responseTime ?? null,
            message: entry.message || entry.msg || "",
            hostname: entry.hostname || "",
            errorType: entry.err?.type || null,
            errorMessage: entry.err?.message || entry.error || null,
            errorStack: entry.err?.stack || null,
            raw: entry,
        };
    }
    catch {
        return null;
    }
}
async function getExportHistory(req) {
    try {
        const query = req.query;
        const offset = (query.page - 1) * query.limit;
        const where = {};
        if (query.environment)
            where.environment = query.environment;
        if (query.date)
            where.date = query.date;
        if (query.logType)
            where.log_type = query.logType;
        const { count, rows: data } = await models_1.LogExport.findAndCountAll({
            where,
            order: [["createdAt", "DESC"]],
            limit: query.limit,
            offset,
            raw: true,
        });
        return (0, response_1.success)("Export history fetched successfully", { count, rows: data });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, `Failed to fetch export history: ${message}`);
    }
}
async function getAvailableDates(req) {
    try {
        const query = req.query;
        const env = query.environment || config_1.config.app.env;
        const envLogDir = (0, path_1.join)(config_1.config.logging.dir, env);
        if (!(0, fs_1.existsSync)(envLogDir)) {
            return (0, response_1.success)("Available dates fetched successfully", { environment: env, dates: [] });
        }
        const dates = (0, fs_1.readdirSync)(envLogDir, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(dirent.name))
            .map((dirent) => {
            const dateDir = (0, path_1.join)(envLogDir, dirent.name);
            const hasInfo = (0, fs_1.existsSync)((0, path_1.join)(dateDir, "info.log"));
            const hasError = (0, fs_1.existsSync)((0, path_1.join)(dateDir, "error.log"));
            return {
                date: dirent.name,
                hasInfoLog: hasInfo,
                hasErrorLog: hasError,
            };
        })
            .sort((a, b) => b.date.localeCompare(a.date));
        return (0, response_1.success)("Available dates fetched successfully", { environment: env, dates });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, `Failed to fetch available dates: ${message}`);
    }
}
async function getAvailableEnvironments() {
    try {
        const env = config_1.config.app.env;
        const logDir = `${config_1.config.logging.dir}/${env}`;
        if (!(0, fs_1.existsSync)(logDir)) {
            return (0, response_1.success)("Available environments fetched successfully", { environments: [] });
        }
        const environments = (0, fs_1.readdirSync)(logDir, { withFileTypes: true }).filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);
        return (0, response_1.success)("Available environments fetched successfully", { environments });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, `Failed to fetch environments: ${message}`);
    }
}
function flattenObject(obj, prefix = "") {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}_${key}` : key;
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
            Object.assign(result, flattenObject(value, newKey));
        }
        else {
            result[newKey] = value;
        }
    }
    return result;
}
const LOG_COLUMN_MAPPING = [
    { label: "Request ID", value: "request_id" },
    { label: "Level", value: "level" },
    { label: "Timestamp", value: "timestamp" },
    { label: "User ID", value: "user_id" },
    { label: "Authorised", value: "authorised" },
    { label: "Hostname", value: "hostname" },
    { label: "PID", value: "pid" },
    { label: "Payload", value: "payload" },
    { label: "Params", value: "params" },
    { label: "Method", value: "method" },
    { label: "Endpoint", value: "endpoint" },
    { label: "Full URL", value: "full_url" },
    { label: "Status Code", value: "status_code" },
    { label: "Response Time (ms)", value: "response_time_ms" },
    { label: "Response Data", value: "responseData" },
    { label: "Message", value: "message" },
    { label: "IP Address", value: "ip_address" },
    { label: "User Agent", value: "client_user_agent" },
    { label: "Device Type", value: "client_device_type" },
    { label: "Browser", value: "client_browser_name" },
    { label: "OS", value: "client_os_name" },
];
async function filterLogs(req) {
    try {
        const query = req.query;
        const date = query.date;
        const level = query.level || "";
        const env = config_1.config.app.env;
        const logDir = (0, path_1.join)(config_1.config.logging.dir, env, date, level?.toLowerCase() + ".log");
        if (!(0, fs_1.existsSync)(logDir)) {
            return (0, response_1.error)(status_1.HttpStatus.NOT_FOUND, `No logs found for ${date} in environment`);
        }
        const logs = [];
        const filePath = (0, path_1.join)(logDir);
        if ((0, fs_1.existsSync)(filePath)) {
            const content = (0, fs_1.readFileSync)(filePath, "utf-8");
            const lines = content.split("\n").filter((l) => l.trim());
            for (const line of lines) {
                const parsed = parseLogLine(line);
                if (parsed)
                    logs.push(parsed);
            }
        }
        // Sort by timestamp
        logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        // Filter by level if provided
        const filteredLogs = query.level
            ? logs.filter((log) => log.level === query.level)
            : logs;
        // Flatten nested objects to key_value format
        const flattenedLogs = filteredLogs.map((log) => flattenObject(log.raw));
        // Generate Excel file and save to exports folder
        const exportDir = config_1.config.logging.exportDir || (0, path_1.join)(process.cwd(), "exports");
        if (!(0, fs_1.existsSync)(exportDir)) {
            (0, fs_1.mkdirSync)(exportDir, { recursive: true });
        }
        const excelBuffer = await convertToExcel(flattenedLogs, LOG_COLUMN_MAPPING);
        const fileName = `logs_${date}_${level || "all"}_${Date.now()}.xlsx`;
        const exportFilePath = (0, path_1.join)(exportDir, fileName);
        (0, fs_1.writeFileSync)(exportFilePath, excelBuffer);
        // Save filter history to database
        await models_1.LogExport.create({
            environment: config_1.config.app.env,
            date,
            log_type: (query.level || "ALL"),
            status: "completed",
            total_records: flattenedLogs.length,
            file_path: exportFilePath,
            filters: query.level ? { level: query.level } : null,
            exported_by: req.userId || null,
        });
        return (0, response_1.success)("Logs fetched successfully", {
            totalRecords: flattenedLogs.length,
            date,
            level: query.level || "all",
            logs: flattenedLogs,
            excel: {
                fileName,
                filePath: exportFilePath,
            },
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, `Failed to filter logs: ${message}`);
    }
}
async function convertToExcel(data, columnMapping) {
    const workbook = new exceljs_1.default.Workbook();
    workbook.creator = "Log Export System";
    workbook.created = new Date();
    const worksheet = workbook.addWorksheet("Data");
    // Set columns based on mapping
    worksheet.columns = columnMapping.map((col) => ({
        header: col.label,
        key: col.value,
        width: 25,
    }));
    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2E7D32" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 25;
    // Add data rows
    data.forEach((item, index) => {
        const rowData = {};
        columnMapping.forEach((col) => {
            rowData[col.value] = item[col.value] ?? "N/A";
        });
        const row = worksheet.addRow(rowData);
        row.alignment = { vertical: "middle", horizontal: "center" };
        // Alternate row colors
        if (index % 2 === 0) {
            row.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFF5F5F5" },
            };
        }
    });
    // Auto-filter
    if (data.length > 0) {
        worksheet.autoFilter = {
            from: "A1",
            to: `${String.fromCharCode(64 + columnMapping.length)}${data.length + 1}`,
        };
    }
    // Freeze header row
    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}
