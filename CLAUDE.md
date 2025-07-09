# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an n8n community node package that provides integration with the Sumsub identity verification API. The node enables automated identity verification workflows by connecting n8n to Sumsub's KYC/AML platform.

## Development Commands

### Build Commands

- `npm run build` - Clean build: removes dist/ directory, compiles TypeScript, and copies icons
- `npm run dev` - Watch mode: compiles TypeScript with file watching enabled
- `tsc` - Direct TypeScript compilation without cleanup or icons

### Code Quality Commands

- `npm run lint` - Run ESLint on nodes, credentials, and package.json
- `npm run lintfix` - Run ESLint with automatic fixes
- `npm run format` - Format code using Prettier on nodes and credentials directories

### Publishing Commands

- `npm run prepublishOnly` - Pre-publish script that builds, then runs strict linting with `.eslintrc.prepublish.js`

## Architecture Overview

### Core Components

**Main Node Implementation (`nodes/Sumsub/Sumsub.node.ts`)**

- Implements the main n8n node class with execute() method
- Handles HMAC-SHA256 signature authentication for Sumsub API
- Supports applicant operations: create, get, getStatus, update, generateWebsdkLink
- Uses typed interfaces for API requests/responses based on Sumsub API documentation

**Node Configuration (`nodes/Sumsub/SumsubDescription.ts`)**

- Defines the UI form fields and operations for the n8n node
- Configures parameter validation and display options
- Maps operations to their required/optional fields

**API Credentials (`credentials/SumsubApi.credentials.ts`)**

- Defines the credential schema for Sumsub API authentication
- Requires: App Token, App Secret, API URL (defaults to <https://api.sumsub.com>)
- Implements secure credential storage with password field types

### Authentication System

The node implements Sumsub's required HMAC-SHA256 authentication:

- `createSignature()` function generates signatures using timestamp + method + path + body
- `makeRequest()` helper handles all API calls with proper authentication headers
- Uses crypto.createHmac() for signature generation

### API Operations

**Applicant Resource Operations:**

- `create` - Create new applicant with external user ID and verification level
  - Operation/action "Create an applicant", implemented by "createApplicant", is documented at: <https://docs.sumsub.com/reference/create-applicant>
- `get` - Retrieve complete applicant information
  - Operation/action "Get an applicant", implemented by "getApplicant", is documented at: <https://docs.sumsub.com/reference/get-applicant-data>
- `getStatus` - Get current verification status
  - Operation/action "Get applicant status", implemented by "getApplicantStatus", is documented at: <https://docs.sumsub.com/reference/get-applicant-review-status>
- `update` - Update applicant information
  - Operation/action "Update an applicant", implemented by "updateApplicant", is documented at: <https://docs.sumsub.com/reference/change-applicant-information-extracted-by-sumsub>

**SDK Integrations Resource Operations:**

- `generateWebsdkLink` - Generate external WebSDK verification link
  - Operation/action "Generate web sdk link", implemented by "generateWebsdkLink", is documented at: <https://docs.sumsub.com/reference/generate-websdk-external-link>

Each operation has dedicated function implementations with proper TypeScript typing.

## Build System

### TypeScript Configuration

- Target: ES2019 with strict type checking enabled
- Outputs to `dist/` directory with declarations and source maps
- Includes credentials, nodes, and package.json in compilation

### Asset Pipeline

- Gulp task `build:icons` copies .svg and .png files from nodes/ and credentials/ to dist/
- Icons are required for n8n node display

### ESLint Configuration

- Uses `eslint-plugin-n8n-nodes-base` for n8n-specific rules
- Separate rule sets for package.json, credentials, and nodes
- Strict rules for n8n naming conventions and parameter definitions

## File Structure

```text
├── credentials/
│   └── SumsubApi.credentials.ts    # API credential definition
├── nodes/
│   └── Sumsub/
│       ├── Sumsub.node.ts          # Main node implementation
│       ├── SumsubDescription.ts     # UI configuration
│       ├── Sumsub.node.json        # Node metadata
│       └── sumsub.svg              # Node icon
├── dist/                           # Compiled output (git ignored)
├── gulpfile.js                     # Asset pipeline for icons
├── tsconfig.json                   # TypeScript configuration
├── .eslintrc.js                    # Main ESLint config
└── .eslintrc.prepublish.js         # Strict pre-publish linting
```

## Testing and Validation

- ESLint rules enforce n8n community node standards
- TypeScript strict mode ensures type safety
- Pre-publish linting prevents common n8n node issues
- No automated tests are currently implemented

## Development Notes

- The node uses n8n-workflow types and interfaces
- All API responses are properly typed with TypeScript interfaces
- Error handling uses NodeOperationError for n8n integration
- The implementation follows n8n community node best practices
