<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 1.75rem;
            font-weight: bold;
        }
        .header p {
            margin: 0.5rem 0 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 2rem;
        }
        .greeting {
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }
        .message {
            margin-bottom: 2rem;
            line-height: 1.7;
        }
        .button-container {
            text-align: center;
            margin: 2rem 0;
        }
        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
            color: white;
            text-decoration: none;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
            transition: transform 0.2s;
        }
        .reset-button:hover {
            transform: translateY(-1px);
        }
        .alternative {
            background-color: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 2rem 0;
        }
        .alternative h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1rem;
            font-weight: 600;
        }
        .alternative p {
            margin: 0;
            font-size: 0.875rem;
            color: #6b7280;
        }
        .link-text {
            word-break: break-all;
            color: #2563eb;
            font-family: monospace;
            font-size: 0.875rem;
            background-color: #f1f5f9;
            padding: 0.5rem;
            border-radius: 4px;
            margin-top: 0.5rem;
        }
        .footer {
            background-color: #f8fafc;
            padding: 1.5rem 2rem;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 0;
            font-size: 0.875rem;
            color: #6b7280;
        }
        .security-notice {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 1rem;
            margin: 1.5rem 0;
        }
        .security-notice h4 {
            margin: 0 0 0.5rem 0;
            color: #92400e;
            font-size: 0.875rem;
            font-weight: 600;
        }
        .security-notice p {
            margin: 0;
            font-size: 0.875rem;
            color: #92400e;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .content {
                padding: 1.5rem;
            }
            .header {
                padding: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
            <p>Risk Profiling System</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hello {{ $user->first_name ?? 'User' }},
            </div>
            
            <div class="message">
                <p>We received a request to reset your password for your Risk Profiling System account. If you made this request, please click the button below to reset your password:</p>
            </div>
            
            <div class="button-container">
                <a href="{{ $resetUrl }}" class="reset-button">Reset Password</a>
            </div>
            
            <div class="alternative">
                <h3>Having trouble with the button?</h3>
                <p>Copy and paste this link into your browser:</p>
                <div class="link-text">{{ $resetUrl }}</div>
            </div>
            
            <div class="security-notice">
                <h4>🔒 Security Notice</h4>
                <p>This password reset link will expire in 60 minutes for security reasons. If you didn't request this password reset, please ignore this email - your account remains secure.</p>
            </div>
            
            <div class="message">
                <p><strong>What happens next?</strong></p>
                <ul>
                    <li>Click the reset link above</li>
                    <li>Create a new secure password</li>
                    <li>Sign in with your new password</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>
                © {{ date('Y') }} RBT Bank Inc. All rights reserved.<br>
                This is an automated message, please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>