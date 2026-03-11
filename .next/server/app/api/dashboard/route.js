/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/dashboard/route";
exports.ids = ["app/api/dashboard/route"];
exports.modules = {

/***/ "(rsc)/./app/api/dashboard/route.ts":
/*!************************************!*\
  !*** ./app/api/dashboard/route.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_auth_getContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth/getContext */ \"(rsc)/./lib/auth/getContext.ts\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\nasync function GET() {\n    try {\n        const { organizationId } = await (0,_lib_auth_getContext__WEBPACK_IMPORTED_MODULE_1__.getTenantContext)();\n        const [totalLots, purchaseAgg, salesAgg, rejectionAgg, totalPurchases, totalSales] = await Promise.all([\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.lot.count({\n                where: {\n                    organizationId\n                }\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.purchase.aggregate({\n                where: {\n                    organizationId\n                },\n                _sum: {\n                    purchasePrice: true\n                }\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.sales.aggregate({\n                where: {\n                    organizationId\n                },\n                _sum: {\n                    salePrice: true\n                }\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.rejection.count({\n                where: {\n                    organizationId,\n                    sentToManufacturer: false\n                } // Pending rejection assumption\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.purchase.count({\n                where: {\n                    organizationId\n                }\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.sales.count({\n                where: {\n                    organizationId\n                }\n            })\n        ]);\n        const purchaseValue = purchaseAgg._sum.purchasePrice || 0;\n        const salesValue = salesAgg._sum.salePrice || 0;\n        const netProfitLoss = salesValue - purchaseValue;\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            totalLots,\n            totalSubLots: totalLots,\n            purchaseValue,\n            salesValue,\n            netProfitLoss,\n            rejectionPending: rejectionAgg,\n            totalTransactions: totalPurchases + totalSales,\n            transactionBreakdown: `${totalPurchases} purchases · ${totalSales} sales`\n        });\n    } catch (error) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: error.message\n        }, {\n            status: 401\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2Rhc2hib2FyZC9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQTJDO0FBQ2M7QUFDbkI7QUFFL0IsZUFBZUc7SUFDcEIsSUFBSTtRQUNGLE1BQU0sRUFBRUMsY0FBYyxFQUFFLEdBQUcsTUFBTUgsc0VBQWdCQTtRQUVqRCxNQUFNLENBQ0pJLFdBQ0FDLGFBQ0FDLFVBQ0FDLGNBQ0FDLGdCQUNBQyxXQUNELEdBQUcsTUFBTUMsUUFBUUMsR0FBRyxDQUFDO1lBQ3BCViwrQ0FBTUEsQ0FBQ1csR0FBRyxDQUFDQyxLQUFLLENBQUM7Z0JBQUVDLE9BQU87b0JBQUVYO2dCQUFlO1lBQUU7WUFDN0NGLCtDQUFNQSxDQUFDYyxRQUFRLENBQUNDLFNBQVMsQ0FBQztnQkFDeEJGLE9BQU87b0JBQUVYO2dCQUFlO2dCQUN4QmMsTUFBTTtvQkFBRUMsZUFBZTtnQkFBSztZQUM5QjtZQUNBakIsK0NBQU1BLENBQUNrQixLQUFLLENBQUNILFNBQVMsQ0FBQztnQkFDckJGLE9BQU87b0JBQUVYO2dCQUFlO2dCQUN4QmMsTUFBTTtvQkFBRUcsV0FBVztnQkFBSztZQUMxQjtZQUNBbkIsK0NBQU1BLENBQUNvQixTQUFTLENBQUNSLEtBQUssQ0FBQztnQkFDckJDLE9BQU87b0JBQUVYO29CQUFnQm1CLG9CQUFvQjtnQkFBTSxFQUFFLCtCQUErQjtZQUN0RjtZQUNBckIsK0NBQU1BLENBQUNjLFFBQVEsQ0FBQ0YsS0FBSyxDQUFDO2dCQUFFQyxPQUFPO29CQUFFWDtnQkFBZTtZQUFFO1lBQ2xERiwrQ0FBTUEsQ0FBQ2tCLEtBQUssQ0FBQ04sS0FBSyxDQUFDO2dCQUFFQyxPQUFPO29CQUFFWDtnQkFBZTtZQUFFO1NBQ2hEO1FBRUQsTUFBTW9CLGdCQUFnQmxCLFlBQVlZLElBQUksQ0FBQ0MsYUFBYSxJQUFJO1FBQ3hELE1BQU1NLGFBQWFsQixTQUFTVyxJQUFJLENBQUNHLFNBQVMsSUFBSTtRQUM5QyxNQUFNSyxnQkFBZ0JELGFBQWFEO1FBRW5DLE9BQU94QixxREFBWUEsQ0FBQzJCLElBQUksQ0FBQztZQUN2QnRCO1lBQ0F1QixjQUFjdkI7WUFDZG1CO1lBQ0FDO1lBQ0FDO1lBQ0FHLGtCQUFrQnJCO1lBQ2xCc0IsbUJBQW1CckIsaUJBQWlCQztZQUNwQ3FCLHNCQUFzQixHQUFHdEIsZUFBZSxhQUFhLEVBQUVDLFdBQVcsTUFBTSxDQUFDO1FBQzNFO0lBQ0YsRUFBRSxPQUFPc0IsT0FBWTtRQUNuQixPQUFPaEMscURBQVlBLENBQUMyQixJQUFJLENBQUM7WUFBRUssT0FBT0EsTUFBTUMsT0FBTztRQUFDLEdBQUc7WUFBRUMsUUFBUTtRQUFJO0lBQ25FO0FBQ0YiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcRGVsbFxcRGVza3RvcFxcZGhhbmRld2FsYVxcZ2Vtcy1zdG9uZS1hbmQtamV3ZWxlcnMtZGF0YWJhc2UtbWFuYWdlbWVudC1zeXN0ZW0tXFxhcHBcXGFwaVxcZGFzaGJvYXJkXFxyb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIjtcclxuaW1wb3J0IHsgZ2V0VGVuYW50Q29udGV4dCB9IGZyb20gXCJAL2xpYi9hdXRoL2dldENvbnRleHRcIjtcclxuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSBcIkAvbGliL3ByaXNtYVwiO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVCgpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBvcmdhbml6YXRpb25JZCB9ID0gYXdhaXQgZ2V0VGVuYW50Q29udGV4dCgpO1xyXG5cclxuICAgIGNvbnN0IFtcclxuICAgICAgdG90YWxMb3RzLFxyXG4gICAgICBwdXJjaGFzZUFnZyxcclxuICAgICAgc2FsZXNBZ2csXHJcbiAgICAgIHJlamVjdGlvbkFnZyxcclxuICAgICAgdG90YWxQdXJjaGFzZXMsXHJcbiAgICAgIHRvdGFsU2FsZXNcclxuICAgIF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgIHByaXNtYS5sb3QuY291bnQoeyB3aGVyZTogeyBvcmdhbml6YXRpb25JZCB9IH0pLFxyXG4gICAgICBwcmlzbWEucHVyY2hhc2UuYWdncmVnYXRlKHtcclxuICAgICAgICB3aGVyZTogeyBvcmdhbml6YXRpb25JZCB9LFxyXG4gICAgICAgIF9zdW06IHsgcHVyY2hhc2VQcmljZTogdHJ1ZSB9XHJcbiAgICAgIH0pLFxyXG4gICAgICBwcmlzbWEuc2FsZXMuYWdncmVnYXRlKHtcclxuICAgICAgICB3aGVyZTogeyBvcmdhbml6YXRpb25JZCB9LFxyXG4gICAgICAgIF9zdW06IHsgc2FsZVByaWNlOiB0cnVlIH1cclxuICAgICAgfSksXHJcbiAgICAgIHByaXNtYS5yZWplY3Rpb24uY291bnQoe1xyXG4gICAgICAgIHdoZXJlOiB7IG9yZ2FuaXphdGlvbklkLCBzZW50VG9NYW51ZmFjdHVyZXI6IGZhbHNlIH0gLy8gUGVuZGluZyByZWplY3Rpb24gYXNzdW1wdGlvblxyXG4gICAgICB9KSxcclxuICAgICAgcHJpc21hLnB1cmNoYXNlLmNvdW50KHsgd2hlcmU6IHsgb3JnYW5pemF0aW9uSWQgfSB9KSxcclxuICAgICAgcHJpc21hLnNhbGVzLmNvdW50KHsgd2hlcmU6IHsgb3JnYW5pemF0aW9uSWQgfSB9KVxyXG4gICAgXSk7XHJcblxyXG4gICAgY29uc3QgcHVyY2hhc2VWYWx1ZSA9IHB1cmNoYXNlQWdnLl9zdW0ucHVyY2hhc2VQcmljZSB8fCAwO1xyXG4gICAgY29uc3Qgc2FsZXNWYWx1ZSA9IHNhbGVzQWdnLl9zdW0uc2FsZVByaWNlIHx8IDA7XHJcbiAgICBjb25zdCBuZXRQcm9maXRMb3NzID0gc2FsZXNWYWx1ZSAtIHB1cmNoYXNlVmFsdWU7XHJcblxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcclxuICAgICAgdG90YWxMb3RzLFxyXG4gICAgICB0b3RhbFN1YkxvdHM6IHRvdGFsTG90cywgLy8gQXNzdW1pbmcgU3ViTG90cyBhcmUgbWVyZ2VkIHRvIGxvdHMgbm93XHJcbiAgICAgIHB1cmNoYXNlVmFsdWUsXHJcbiAgICAgIHNhbGVzVmFsdWUsXHJcbiAgICAgIG5ldFByb2ZpdExvc3MsXHJcbiAgICAgIHJlamVjdGlvblBlbmRpbmc6IHJlamVjdGlvbkFnZyxcclxuICAgICAgdG90YWxUcmFuc2FjdGlvbnM6IHRvdGFsUHVyY2hhc2VzICsgdG90YWxTYWxlcyxcclxuICAgICAgdHJhbnNhY3Rpb25CcmVha2Rvd246IGAke3RvdGFsUHVyY2hhc2VzfSBwdXJjaGFzZXMgwrcgJHt0b3RhbFNhbGVzfSBzYWxlc2BcclxuICAgIH0pO1xyXG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiBlcnJvci5tZXNzYWdlIH0sIHsgc3RhdHVzOiA0MDEgfSk7XHJcbiAgfVxyXG59XHJcbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJnZXRUZW5hbnRDb250ZXh0IiwicHJpc21hIiwiR0VUIiwib3JnYW5pemF0aW9uSWQiLCJ0b3RhbExvdHMiLCJwdXJjaGFzZUFnZyIsInNhbGVzQWdnIiwicmVqZWN0aW9uQWdnIiwidG90YWxQdXJjaGFzZXMiLCJ0b3RhbFNhbGVzIiwiUHJvbWlzZSIsImFsbCIsImxvdCIsImNvdW50Iiwid2hlcmUiLCJwdXJjaGFzZSIsImFnZ3JlZ2F0ZSIsIl9zdW0iLCJwdXJjaGFzZVByaWNlIiwic2FsZXMiLCJzYWxlUHJpY2UiLCJyZWplY3Rpb24iLCJzZW50VG9NYW51ZmFjdHVyZXIiLCJwdXJjaGFzZVZhbHVlIiwic2FsZXNWYWx1ZSIsIm5ldFByb2ZpdExvc3MiLCJqc29uIiwidG90YWxTdWJMb3RzIiwicmVqZWN0aW9uUGVuZGluZyIsInRvdGFsVHJhbnNhY3Rpb25zIiwidHJhbnNhY3Rpb25CcmVha2Rvd24iLCJlcnJvciIsIm1lc3NhZ2UiLCJzdGF0dXMiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/dashboard/route.ts\n");

/***/ }),

/***/ "(rsc)/./auth.config.ts":
/*!************************!*\
  !*** ./auth.config.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authConfig: () => (/* binding */ authConfig)\n/* harmony export */ });\nconst authConfig = {\n    providers: [],\n    pages: {\n        signIn: \"/login\"\n    },\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.role = user.role;\n                token.id = user.id;\n                token.organizationId = user.organizationId;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.role = token.role;\n                session.user.id = token.id;\n                session.user.organizationId = token.organizationId;\n            }\n            return session;\n        }\n    },\n    session: {\n        strategy: \"jwt\"\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hdXRoLmNvbmZpZy50cyIsIm1hcHBpbmdzIjoiOzs7O0FBRU8sTUFBTUEsYUFBYTtJQUN4QkMsV0FBVyxFQUFFO0lBQ2JDLE9BQU87UUFDTEMsUUFBUTtJQUNWO0lBQ0FDLFdBQVc7UUFDVCxNQUFNQyxLQUFJLEVBQUVDLEtBQUssRUFBRUMsSUFBSSxFQUE2QjtZQUNsRCxJQUFJQSxNQUFNO2dCQUNSRCxNQUFNRSxJQUFJLEdBQUcsS0FBY0EsSUFBSTtnQkFDL0JGLE1BQU1HLEVBQUUsR0FBR0YsS0FBS0UsRUFBRTtnQkFDbEJILE1BQU1JLGNBQWMsR0FBRyxLQUFjQSxjQUFjO1lBQ3JEO1lBQ0EsT0FBT0o7UUFDVDtRQUNBLE1BQU1LLFNBQVEsRUFBRUEsT0FBTyxFQUFFTCxLQUFLLEVBQWdDO1lBQzVELElBQUlLLFFBQVFKLElBQUksRUFBRTtnQkFDZkksUUFBUUosSUFBSSxDQUFTQyxJQUFJLEdBQUdGLE1BQU1FLElBQUk7Z0JBQ3RDRyxRQUFRSixJQUFJLENBQVNFLEVBQUUsR0FBR0gsTUFBTUcsRUFBRTtnQkFDbENFLFFBQVFKLElBQUksQ0FBU0csY0FBYyxHQUFHSixNQUFNSSxjQUFjO1lBQzdEO1lBQ0EsT0FBT0M7UUFDVDtJQUNGO0lBQ0FBLFNBQVM7UUFDUEMsVUFBVTtJQUNaO0FBQ0YsRUFBMkIiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcRGVsbFxcRGVza3RvcFxcZGhhbmRld2FsYVxcZ2Vtcy1zdG9uZS1hbmQtamV3ZWxlcnMtZGF0YWJhc2UtbWFuYWdlbWVudC1zeXN0ZW0tXFxhdXRoLmNvbmZpZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IE5leHRBdXRoQ29uZmlnIH0gZnJvbSBcIm5leHQtYXV0aFwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGF1dGhDb25maWcgPSB7XHJcbiAgcHJvdmlkZXJzOiBbXSxcclxuICBwYWdlczoge1xyXG4gICAgc2lnbkluOiBcIi9sb2dpblwiLFxyXG4gIH0sXHJcbiAgY2FsbGJhY2tzOiB7XHJcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciB9OiB7IHRva2VuOiBhbnksIHVzZXI6IGFueSB9KSB7XHJcbiAgICAgIGlmICh1c2VyKSB7XHJcbiAgICAgICAgdG9rZW4ucm9sZSA9ICh1c2VyIGFzIGFueSkucm9sZTtcclxuICAgICAgICB0b2tlbi5pZCA9IHVzZXIuaWQ7XHJcbiAgICAgICAgdG9rZW4ub3JnYW5pemF0aW9uSWQgPSAodXNlciBhcyBhbnkpLm9yZ2FuaXphdGlvbklkO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0b2tlbjtcclxuICAgIH0sXHJcbiAgICBhc3luYyBzZXNzaW9uKHsgc2Vzc2lvbiwgdG9rZW4gfTogeyBzZXNzaW9uOiBhbnksIHRva2VuOiBhbnkgfSkge1xyXG4gICAgICBpZiAoc2Vzc2lvbi51c2VyKSB7XHJcbiAgICAgICAgKHNlc3Npb24udXNlciBhcyBhbnkpLnJvbGUgPSB0b2tlbi5yb2xlO1xyXG4gICAgICAgIChzZXNzaW9uLnVzZXIgYXMgYW55KS5pZCA9IHRva2VuLmlkO1xyXG4gICAgICAgIChzZXNzaW9uLnVzZXIgYXMgYW55KS5vcmdhbml6YXRpb25JZCA9IHRva2VuLm9yZ2FuaXphdGlvbklkO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzZXNzaW9uO1xyXG4gICAgfSxcclxuICB9LFxyXG4gIHNlc3Npb246IHtcclxuICAgIHN0cmF0ZWd5OiBcImp3dFwiLFxyXG4gIH0sXHJcbn0gc2F0aXNmaWVzIE5leHRBdXRoQ29uZmlnO1xyXG4iXSwibmFtZXMiOlsiYXV0aENvbmZpZyIsInByb3ZpZGVycyIsInBhZ2VzIiwic2lnbkluIiwiY2FsbGJhY2tzIiwiand0IiwidG9rZW4iLCJ1c2VyIiwicm9sZSIsImlkIiwib3JnYW5pemF0aW9uSWQiLCJzZXNzaW9uIiwic3RyYXRlZ3kiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./auth.config.ts\n");

/***/ }),

/***/ "(rsc)/./auth.ts":
/*!*****************!*\
  !*** ./auth.ts ***!
  \*****************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   auth: () => (/* binding */ auth),\n/* harmony export */   handlers: () => (/* binding */ handlers)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _auth_config__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./auth.config */ \"(rsc)/./auth.config.ts\");\n\n\n\n\n\nconst prisma = new _prisma_client__WEBPACK_IMPORTED_MODULE_2__.PrismaClient();\nconst { handlers, auth } = (0,next_auth__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n    ..._auth_config__WEBPACK_IMPORTED_MODULE_4__.authConfig,\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) return null;\n                const user = await prisma.user.findUnique({\n                    where: {\n                        email: credentials.email\n                    }\n                });\n                if (!user) return null;\n                const isValid = await bcryptjs__WEBPACK_IMPORTED_MODULE_3___default().compare(credentials.password, user.password);\n                if (!isValid) return null;\n                return {\n                    id: user.id,\n                    name: user.name,\n                    email: user.email,\n                    role: user.role,\n                    organizationId: user.organizationId\n                };\n            }\n        })\n    ]\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hdXRoLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFpQztBQUN5QjtBQUNaO0FBQ2hCO0FBQ2E7QUFFM0MsTUFBTUssU0FBUyxJQUFJSCx3REFBWUE7QUFFeEIsTUFBTSxFQUFFSSxRQUFRLEVBQUVDLElBQUksRUFBRSxHQUFHUCxxREFBUUEsQ0FBQztJQUN6QyxHQUFHSSxvREFBVTtJQUNiSSxXQUFXO1FBQ1RQLDJFQUFXQSxDQUFDO1lBQ1ZRLE1BQU07WUFDTkMsYUFBYTtnQkFDWEMsT0FBTztvQkFBRUMsT0FBTztvQkFBU0MsTUFBTTtnQkFBUTtnQkFDdkNDLFVBQVU7b0JBQUVGLE9BQU87b0JBQVlDLE1BQU07Z0JBQVc7WUFDbEQ7WUFDQSxNQUFNRSxXQUFVTCxXQUFnQjtnQkFDOUIsSUFBSSxDQUFDQSxhQUFhQyxTQUFTLENBQUNELGFBQWFJLFVBQVUsT0FBTztnQkFFMUQsTUFBTUUsT0FBTyxNQUFNWCxPQUFPVyxJQUFJLENBQUNDLFVBQVUsQ0FBQztvQkFDeENDLE9BQU87d0JBQUVQLE9BQU9ELFlBQVlDLEtBQUs7b0JBQVc7Z0JBQzlDO2dCQUVBLElBQUksQ0FBQ0ssTUFBTSxPQUFPO2dCQUVsQixNQUFNRyxVQUFVLE1BQU1oQix1REFBYyxDQUNsQ08sWUFBWUksUUFBUSxFQUNwQkUsS0FBS0YsUUFBUTtnQkFHZixJQUFJLENBQUNLLFNBQVMsT0FBTztnQkFFckIsT0FBTztvQkFDTEUsSUFBSUwsS0FBS0ssRUFBRTtvQkFDWFosTUFBTU8sS0FBS1AsSUFBSTtvQkFDZkUsT0FBT0ssS0FBS0wsS0FBSztvQkFDakJXLE1BQU1OLEtBQUtNLElBQUk7b0JBQ2ZDLGdCQUFnQlAsS0FBS08sY0FBYztnQkFDckM7WUFDRjtRQUNGO0tBQ0Q7QUFDSCxHQUFHIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXERlbGxcXERlc2t0b3BcXGRoYW5kZXdhbGFcXGdlbXMtc3RvbmUtYW5kLWpld2VsZXJzLWRhdGFiYXNlLW1hbmFnZW1lbnQtc3lzdGVtLVxcYXV0aC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTmV4dEF1dGggZnJvbSBcIm5leHQtYXV0aFwiO1xyXG5pbXBvcnQgQ3JlZGVudGlhbHMgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvY3JlZGVudGlhbHNcIjtcclxuaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSBcIkBwcmlzbWEvY2xpZW50XCI7XHJcbmltcG9ydCBiY3J5cHQgZnJvbSBcImJjcnlwdGpzXCI7XHJcbmltcG9ydCB7IGF1dGhDb25maWcgfSBmcm9tIFwiLi9hdXRoLmNvbmZpZ1wiO1xyXG5cclxuY29uc3QgcHJpc21hID0gbmV3IFByaXNtYUNsaWVudCgpO1xyXG5cclxuZXhwb3J0IGNvbnN0IHsgaGFuZGxlcnMsIGF1dGggfSA9IE5leHRBdXRoKHtcclxuICAuLi5hdXRoQ29uZmlnLFxyXG4gIHByb3ZpZGVyczogW1xyXG4gICAgQ3JlZGVudGlhbHMoe1xyXG4gICAgICBuYW1lOiBcImNyZWRlbnRpYWxzXCIsXHJcbiAgICAgIGNyZWRlbnRpYWxzOiB7XHJcbiAgICAgICAgZW1haWw6IHsgbGFiZWw6IFwiRW1haWxcIiwgdHlwZTogXCJlbWFpbFwiIH0sXHJcbiAgICAgICAgcGFzc3dvcmQ6IHsgbGFiZWw6IFwiUGFzc3dvcmRcIiwgdHlwZTogXCJwYXNzd29yZFwiIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIGFzeW5jIGF1dGhvcml6ZShjcmVkZW50aWFsczogYW55KSB7XHJcbiAgICAgICAgaWYgKCFjcmVkZW50aWFscz8uZW1haWwgfHwgIWNyZWRlbnRpYWxzPy5wYXNzd29yZCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcclxuICAgICAgICAgIHdoZXJlOiB7IGVtYWlsOiBjcmVkZW50aWFscy5lbWFpbCBhcyBzdHJpbmcgfSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKCF1c2VyKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAgICAgY29uc3QgaXNWYWxpZCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKFxyXG4gICAgICAgICAgY3JlZGVudGlhbHMucGFzc3dvcmQgYXMgc3RyaW5nLFxyXG4gICAgICAgICAgdXNlci5wYXNzd29yZFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmICghaXNWYWxpZCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBpZDogdXNlci5pZCxcclxuICAgICAgICAgIG5hbWU6IHVzZXIubmFtZSxcclxuICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxyXG4gICAgICAgICAgcm9sZTogdXNlci5yb2xlLFxyXG4gICAgICAgICAgb3JnYW5pemF0aW9uSWQ6IHVzZXIub3JnYW5pemF0aW9uSWQsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gIF0sXHJcbn0pO1xyXG4iXSwibmFtZXMiOlsiTmV4dEF1dGgiLCJDcmVkZW50aWFscyIsIlByaXNtYUNsaWVudCIsImJjcnlwdCIsImF1dGhDb25maWciLCJwcmlzbWEiLCJoYW5kbGVycyIsImF1dGgiLCJwcm92aWRlcnMiLCJuYW1lIiwiY3JlZGVudGlhbHMiLCJlbWFpbCIsImxhYmVsIiwidHlwZSIsInBhc3N3b3JkIiwiYXV0aG9yaXplIiwidXNlciIsImZpbmRVbmlxdWUiLCJ3aGVyZSIsImlzVmFsaWQiLCJjb21wYXJlIiwiaWQiLCJyb2xlIiwib3JnYW5pemF0aW9uSWQiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./auth.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth/getContext.ts":
/*!********************************!*\
  !*** ./lib/auth/getContext.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getTenantContext: () => (/* binding */ getTenantContext)\n/* harmony export */ });\n/* harmony import */ var _auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/auth */ \"(rsc)/./auth.ts\");\n\nasync function getTenantContext() {\n    const session = await (0,_auth__WEBPACK_IMPORTED_MODULE_0__.auth)();\n    // Cast session.user to any to access the organizationId we'll add\n    const user = session?.user;\n    if (!user || !user.organizationId && user.role !== \"SUPERADMIN\") {\n        throw new Error(\"Unauthorized: No tenant context found\");\n    }\n    return {\n        userId: user.id || user.email,\n        organizationId: user.organizationId,\n        role: user.role\n    };\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC9nZXRDb250ZXh0LnRzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQThCO0FBRXZCLGVBQWVDO0lBQ3BCLE1BQU1DLFVBQVUsTUFBTUYsMkNBQUlBO0lBQzFCLGtFQUFrRTtJQUNsRSxNQUFNRyxPQUFPRCxTQUFTQztJQUV0QixJQUFJLENBQUNBLFFBQVMsQ0FBQ0EsS0FBS0MsY0FBYyxJQUFJRCxLQUFLRSxJQUFJLEtBQUssY0FBZTtRQUNqRSxNQUFNLElBQUlDLE1BQU07SUFDbEI7SUFFQSxPQUFPO1FBQ0xDLFFBQVFKLEtBQUtLLEVBQUUsSUFBSUwsS0FBS00sS0FBSztRQUM3QkwsZ0JBQWdCRCxLQUFLQyxjQUFjO1FBQ25DQyxNQUFNRixLQUFLRSxJQUFJO0lBQ2pCO0FBQ0YiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcRGVsbFxcRGVza3RvcFxcZGhhbmRld2FsYVxcZ2Vtcy1zdG9uZS1hbmQtamV3ZWxlcnMtZGF0YWJhc2UtbWFuYWdlbWVudC1zeXN0ZW0tXFxsaWJcXGF1dGhcXGdldENvbnRleHQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYXV0aCB9IGZyb20gXCJAL2F1dGhcIjtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUZW5hbnRDb250ZXh0KCkge1xyXG4gIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBhdXRoKCk7XHJcbiAgLy8gQ2FzdCBzZXNzaW9uLnVzZXIgdG8gYW55IHRvIGFjY2VzcyB0aGUgb3JnYW5pemF0aW9uSWQgd2UnbGwgYWRkXHJcbiAgY29uc3QgdXNlciA9IHNlc3Npb24/LnVzZXIgYXMgYW55O1xyXG5cclxuICBpZiAoIXVzZXIgfHwgKCF1c2VyLm9yZ2FuaXphdGlvbklkICYmIHVzZXIucm9sZSAhPT0gXCJTVVBFUkFETUlOXCIpKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmF1dGhvcml6ZWQ6IE5vIHRlbmFudCBjb250ZXh0IGZvdW5kXCIpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHVzZXJJZDogdXNlci5pZCB8fCB1c2VyLmVtYWlsLFxyXG4gICAgb3JnYW5pemF0aW9uSWQ6IHVzZXIub3JnYW5pemF0aW9uSWQsXHJcbiAgICByb2xlOiB1c2VyLnJvbGUsXHJcbiAgfTtcclxufVxyXG4iXSwibmFtZXMiOlsiYXV0aCIsImdldFRlbmFudENvbnRleHQiLCJzZXNzaW9uIiwidXNlciIsIm9yZ2FuaXphdGlvbklkIiwicm9sZSIsIkVycm9yIiwidXNlcklkIiwiaWQiLCJlbWFpbCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth/getContext.ts\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient({\n    log: [\n        \"query\"\n    ]\n});\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE4QztBQUU5QyxNQUFNQyxrQkFBa0JDO0FBSWpCLE1BQU1DLFNBQ1hGLGdCQUFnQkUsTUFBTSxJQUN0QixJQUFJSCx3REFBWUEsQ0FBQztJQUNmSSxLQUFLO1FBQUM7S0FBUTtBQUNoQixHQUFHO0FBRUwsSUFBSUMsSUFBcUMsRUFBRUosZ0JBQWdCRSxNQUFNLEdBQUdBIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXERlbGxcXERlc2t0b3BcXGRoYW5kZXdhbGFcXGdlbXMtc3RvbmUtYW5kLWpld2VsZXJzLWRhdGFiYXNlLW1hbmFnZW1lbnQtc3lzdGVtLVxcbGliXFxwcmlzbWEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSBcIkBwcmlzbWEvY2xpZW50XCI7XHJcblxyXG5jb25zdCBnbG9iYWxGb3JQcmlzbWEgPSBnbG9iYWxUaGlzIGFzIHVua25vd24gYXMge1xyXG4gIHByaXNtYTogUHJpc21hQ2xpZW50IHwgdW5kZWZpbmVkO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHByaXNtYSA9XHJcbiAgZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA/P1xyXG4gIG5ldyBQcmlzbWFDbGllbnQoe1xyXG4gICAgbG9nOiBbXCJxdWVyeVwiXSxcclxuICB9KTtcclxuXHJcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpIGdsb2JhbEZvclByaXNtYS5wcmlzbWEgPSBwcmlzbWE7XHJcbiJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJnbG9iYWxGb3JQcmlzbWEiLCJnbG9iYWxUaGlzIiwicHJpc21hIiwibG9nIiwicHJvY2VzcyIsImVudiIsIk5PREVfRU5WIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fdashboard%2Froute&page=%2Fapi%2Fdashboard%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdashboard%2Froute.ts&appDir=C%3A%5CUsers%5CDell%5CDesktop%5Cdhandewala%5Cgems-stone-and-jewelers-database-management-system-%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDell%5CDesktop%5Cdhandewala%5Cgems-stone-and-jewelers-database-management-system-&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fdashboard%2Froute&page=%2Fapi%2Fdashboard%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdashboard%2Froute.ts&appDir=C%3A%5CUsers%5CDell%5CDesktop%5Cdhandewala%5Cgems-stone-and-jewelers-database-management-system-%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDell%5CDesktop%5Cdhandewala%5Cgems-stone-and-jewelers-database-management-system-&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Dell_Desktop_dhandewala_gems_stone_and_jewelers_database_management_system_app_api_dashboard_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/dashboard/route.ts */ \"(rsc)/./app/api/dashboard/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/dashboard/route\",\n        pathname: \"/api/dashboard\",\n        filename: \"route\",\n        bundlePath: \"app/api/dashboard/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Dell\\\\Desktop\\\\dhandewala\\\\gems-stone-and-jewelers-database-management-system-\\\\app\\\\api\\\\dashboard\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Dell_Desktop_dhandewala_gems_stone_and_jewelers_database_management_system_app_api_dashboard_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZkYXNoYm9hcmQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmRhc2hib2FyZCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmRhc2hib2FyZCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNEZWxsJTVDRGVza3RvcCU1Q2RoYW5kZXdhbGElNUNnZW1zLXN0b25lLWFuZC1qZXdlbGVycy1kYXRhYmFzZS1tYW5hZ2VtZW50LXN5c3RlbS0lNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNVc2VycyU1Q0RlbGwlNUNEZXNrdG9wJTVDZGhhbmRld2FsYSU1Q2dlbXMtc3RvbmUtYW5kLWpld2VsZXJzLWRhdGFiYXNlLW1hbmFnZW1lbnQtc3lzdGVtLSZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDd0U7QUFDcko7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXERlbGxcXFxcRGVza3RvcFxcXFxkaGFuZGV3YWxhXFxcXGdlbXMtc3RvbmUtYW5kLWpld2VsZXJzLWRhdGFiYXNlLW1hbmFnZW1lbnQtc3lzdGVtLVxcXFxhcHBcXFxcYXBpXFxcXGRhc2hib2FyZFxcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvZGFzaGJvYXJkL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvZGFzaGJvYXJkXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9kYXNoYm9hcmQvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxEZWxsXFxcXERlc2t0b3BcXFxcZGhhbmRld2FsYVxcXFxnZW1zLXN0b25lLWFuZC1qZXdlbGVycy1kYXRhYmFzZS1tYW5hZ2VtZW50LXN5c3RlbS1cXFxcYXBwXFxcXGFwaVxcXFxkYXNoYm9hcmRcXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fdashboard%2Froute&page=%2Fapi%2Fdashboard%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdashboard%2Froute.ts&appDir=C%3A%5CUsers%5CDell%5CDesktop%5Cdhandewala%5Cgems-stone-and-jewelers-database-management-system-%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDell%5CDesktop%5Cdhandewala%5Cgems-stone-and-jewelers-database-management-system-&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/server/app-render/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/action-async-storage.external.js");

/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("@prisma/client");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/jose","vendor-chunks/oauth4webapi","vendor-chunks/bcryptjs","vendor-chunks/preact","vendor-chunks/preact-render-to-string","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fdashboard%2Froute&page=%2Fapi%2Fdashboard%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdashboard%2Froute.ts&appDir=C%3A%5CUsers%5CDell%5CDesktop%5Cdhandewala%5Cgems-stone-and-jewelers-database-management-system-%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDell%5CDesktop%5Cdhandewala%5Cgems-stone-and-jewelers-database-management-system-&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();