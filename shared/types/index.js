"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.ComplaintStatus = exports.ComplaintCategory = void 0;
var ComplaintCategory;
(function (ComplaintCategory) {
    ComplaintCategory["NOISE_POLLUTION"] = "noise_pollution";
    ComplaintCategory["ENVIRONMENTAL_POLLUTION"] = "environmental_pollution";
    ComplaintCategory["TRAFFIC_CONGESTION"] = "traffic_congestion";
    ComplaintCategory["PUBLIC_FACILITY_DAMAGE"] = "public_facility_damage";
    ComplaintCategory["GARBAGE_DISPOSAL"] = "garbage_disposal";
    ComplaintCategory["CONSTRUCTION_NOISE"] = "construction_noise";
    ComplaintCategory["PARKING_PROBLEM"] = "parking_problem";
    ComplaintCategory["NEIGHBOR_DISPUTE"] = "neighbor_dispute";
    ComplaintCategory["MARKET_ORDER"] = "market_order";
    ComplaintCategory["STREET_VENDING"] = "street_vending";
    ComplaintCategory["OTHER"] = "other";
})(ComplaintCategory || (exports.ComplaintCategory = ComplaintCategory = {}));
var ComplaintStatus;
(function (ComplaintStatus) {
    ComplaintStatus["PENDING"] = "pending";
    ComplaintStatus["ANALYZING"] = "analyzing";
    ComplaintStatus["AUTO_REPLIED"] = "auto_replied";
    ComplaintStatus["MANUAL_PROCESSING"] = "manual_processing";
    ComplaintStatus["RESOLVED"] = "resolved";
    ComplaintStatus["CLOSED"] = "closed";
})(ComplaintStatus || (exports.ComplaintStatus = ComplaintStatus = {}));
var UserRole;
(function (UserRole) {
    UserRole["CITIZEN"] = "citizen";
    UserRole["OPERATOR"] = "operator";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
