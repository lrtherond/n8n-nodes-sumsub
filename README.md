![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-sumsub

This is an **unofficial** n8n community node that provides integration with the Sumsub identity verification API. This node allows you to automate identity verification workflows by connecting n8n to Sumsub's KYC/AML platform.

[Sumsub](https://sumsub.com/) is a comprehensive identity verification platform that helps businesses verify their users' identities and comply with KYC/AML regulations.

## ⚠️ Disclaimer

**This project is not affiliated with, endorsed by, or sponsored by Sumsub.** This is an independent community-developed integration. Use this project at your own risk. The author is not responsible for any issues, data loss, or problems that may arise from using this node.

## What This Node Does

This n8n node enables you to:

- **Automate applicant creation** in Sumsub from your n8n workflows
- **Check verification status** of applicants programmatically
- **Retrieve applicant data** for further processing in your workflows
- **Update applicant information** when needed
- **Integrate identity verification** into larger automation workflows

The node handles all the complex authentication (HMAC-SHA256 signatures) required by the Sumsub API, making it easy to integrate identity verification into your n8n automations.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Applicant Resource

- **Create**: Create a new applicant in Sumsub with external user ID, verification level, and optional personal information
- **Get**: Retrieve complete applicant information including verification status and documents
- **Get Status**: Get current verification status of an applicant (pending, approved, rejected, etc.)
- **Update**: Update applicant information such as email, phone, or personal details

## Credentials

To use this node, you need to configure the following credentials in n8n:

- **App Token**: Your Sumsub application token
- **App Secret**: Your Sumsub application secret key
- **API URL**: The Sumsub API base URL (default: https://api.sumsub.com)

You can obtain the App Token and App Secret from your Sumsub dashboard under the API settings.

## Authentication

This node automatically handles Sumsub's required HMAC-SHA256 signature authentication. Each request is signed with your app secret using the proper timestamp and request data, ensuring secure communication with the Sumsub API.

## Example Workflows

### Automated User Onboarding

1. **Trigger**: New user registration webhook
2. **Sumsub Node**: Create applicant with user's email and external ID
3. **Conditional Logic**: Check if applicant was created successfully
4. **Email Node**: Send verification link to user
5. **Wait Node**: Wait for verification completion
6. **Sumsub Node**: Check verification status
7. **Database Node**: Update user status based on verification result

### Verification Status Monitoring

1. **Schedule Trigger**: Run every hour
2. **Database Node**: Get list of pending applicants
3. **Sumsub Node**: Check status for each applicant
4. **Switch Node**: Route based on verification status
5. **Email/Slack Node**: Notify team of status changes

## API Reference

For more information about the Sumsub API endpoints and data structures, visit the [official Sumsub API documentation](https://developers.sumsub.com/api-reference/).

## Support

This is a community project. For issues related to:

- **This n8n node**: Please open an issue on this repository
- **Sumsub API**: Consult the official Sumsub documentation or support
- **n8n platform**: Visit the n8n community forum

## License

[MIT](LICENSE.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
