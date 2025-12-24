/**
 * @file server/src/docs/openapi.ts
 * @description OpenAPI 3.0 specification for Swagger UI documentation
 */

import { OpenAPIV3 } from "openapi-types";

export const openapiSpec: OpenAPIV3.Document = {
    openapi: "3.0.0",
    info: {
        title: "Referral Management System API",
        version: "1.0.0",
        description: "API for managing Patient Referrals with Event Sourcing",
    },
    servers: [
        {
            url: "/api",
            description: "Main API Server",
        },
    ],
    components: {
        securitySchemes: {
            items: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
    security: [
        {
            items: [],
        },
    ],
    paths: {
        "/health": {
            get: {
                summary: "Health Check",
                description: "Check if the API server is running",
                operationId: "healthCheck",
                security: [], // No auth required
                responses: {
                    "200": {
                        description: "Server is healthy",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "ok" },
                                        mode: { type: "string", example: "development" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/auth/login": {
            post: {
                summary: "Login (Get Token)",
                description: "Sign in with email/password and receive a Firebase ID token. Copy this token and use it in the Authorize button.",
                operationId: "login",
                security: [], // No auth required for login
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: { type: "string", example: "admin@example.com" },
                                    password: { type: "string", example: "admin123" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Login successful - copy the idToken",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        idToken: { type: "string", description: "Use this token in Authorize" },
                                        email: { type: "string" },
                                        expiresIn: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Invalid credentials",
                    },
                },
            },
        },
        "/auth/me": {
            get: {
                summary: "Get Current User",
                operationId: "getCurrentUser",
                responses: {
                    "200": {
                        description: "Current authenticated user details",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        uid: { type: "string" },
                                        email: { type: "string" },
                                        role: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                    },
                },
            },
        },
        "/uploads": {
            post: {
                summary: "Upload Events JSON",
                description: "Admin only. Uploads a raw events file to be reconciled.",
                operationId: "uploadEvents",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    events: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            additionalProperties: true
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Upload processed successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        uploadId: { type: "string" },
                                        processed: { type: "integer" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/referrals": {
            get: {
                summary: "List Referrals",
                operationId: "listReferrals",
                responses: {
                    "200": {
                        description: "List of referrals",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        referrals: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                additionalProperties: true
                                            }
                                        }
                                    }
                                },
                            },
                        },
                    },
                },
            },
        },
        "/referrals/{id}": {
            get: {
                summary: "Get Referral Detail",
                operationId: "getReferral",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string" }
                    }
                ],
                responses: {
                    "200": {
                        description: "Referral detail",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    additionalProperties: true
                                }
                            },
                        },
                    },
                },
            },
        }
    },
};
