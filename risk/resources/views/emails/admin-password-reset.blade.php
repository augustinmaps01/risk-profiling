<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - RBT Bank Risk Profiling System</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #4338ca 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
            font-size: 14px;
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #1e293b;
            margin: 0 0 20px 0;
            font-size: 20px;
            font-weight: 600;
        }
        .content p {
            margin: 0 0 15px 0;
            color: #64748b;
        }
        .password-box {
            background: #f1f5f9;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        .password-label {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 8px;
        }
        .password-value {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: bold;
            color: #dc2626;
            background: white;
            padding: 12px 16px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            letter-spacing: 1px;
        }
        .warning-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        .warning-box p {
            margin: 0;
            color: #92400e;
            font-size: 14px;
        }
        .steps {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .steps h3 {
            margin: 0 0 15px 0;
            color: #1e293b;
            font-size: 16px;
        }
        .steps ol {
            margin: 0;
            padding-left: 20px;
        }
        .steps li {
            margin: 8px 0;
            color: #64748b;
        }
        .footer {
            background: #f8fafc;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            margin: 0;
            color: #94a3b8;
            font-size: 12px;
        }
        .footer a {
            color: #3b82f6;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset</h1>
            <p>RBT Bank Risk Profiling System</p>
        </div>

        <div class="content">
            <h2>Hello {{ $user->first_name }} {{ $user->last_name }},</h2>
            
            <p>Your password for the RBT Bank Risk Profiling System has been reset by {{ $resetByAdmin }}.</p>

            <div class="password-box">
                <div class="password-label">Your New Temporary Password:</div>
                <div class="password-value">{{ $temporaryPassword }}</div>
            </div>

            <div class="warning-box">
                <p><strong>⚠️ Important Security Notice:</strong> This is a temporary password. Please change it immediately after logging in for your security.</p>
            </div>

            <div class="steps">
                <h3>Next Steps:</h3>
                <ol>
                    <li>Log in to the system using the temporary password above</li>
                    <li>Go to your Profile settings</li>
                    <li>Change your password to something secure and memorable</li>
                    <li>Delete this email for security purposes</li>
                </ol>
            </div>

            <p>If you did not request this password reset or have any concerns, please contact your system administrator immediately.</p>

            <p>Best regards,<br>
            <strong>RBT Bank IT Team</strong></p>
        </div>

        <div class="footer">
            <p>This is an automated message from the RBT Bank Risk Profiling System.</p>
            <p>Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>