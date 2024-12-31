const templateContent = /* html*/ `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up Invitation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .email-header {
            text-align: center;
            margin-bottom: 20px;
        }

        .email-content {
            line-height: 1.5;
        }

        .email-footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
            text-align: center;
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="email-header">
            <h1>{{appName}}: Sign Up Invitation</h1>
        </div>
        <div class="email-content">
            <p>Dear {{name}},</p>
            <p>We are thrilled to introduce our innovative video exam platform, {{appName}}! Our platform is designed to
                provide an easy to use remote exam tool for students and teachers. </p>
            <p>To participate in your upcoming exam, please sign up using the following link:</p>
            <p><a href="{{signupLink}}">{{signupLink}}</a></p>
            <p>After signing up, you will gain access to exam schedules, and instructions on how to
                join the video
                exam conference. We are confident that our platform will provide you with a valuable learning experience
                that will
                help you excel in your studies.</p>
            <p>If you have any questions or need assistance, please do not hesitate to contact our support team at
                <a href="mailto:info@{{appDomain}}">info@{{appDomain}}</a>.</p>
            <p>We look forward to your participation in the {{appName}} video exam conference!</p>
            <p>Best regards,</p>
            <p>The {{appName}} Team</p>
        </div>
        <div class="email-footer">
            <p>&copy; {{currentYear}} {{appName}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
export default templateContent
