import { useState, useRef, useEffect, useCallback } from "react";
import { Form, Input, Button, notification } from "antd";
import {
  MailOutlined,
  LockOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  LoginOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosConfig";
import "./ForgotPassword.css";

// ─── Constants ────────────────────────────────────────────
const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 10 * 60; // 10 minutes
const REDIRECT_DELAY = 3000; // 3 seconds

// ─── Helpers ──────────────────────────────────────────────
const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const getPasswordStrength = (password) => {
  if (!password) return { level: 0, text: "" };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 1, text: "Yếu" };
  if (score <= 4) return { level: 2, text: "Trung bình" };
  return { level: 3, text: "Mạnh" };
};

// ─── Component ────────────────────────────────────────────
function ForgotPassword() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();

  // State
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [success, setSuccess] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  // Refs
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  // ─── Timer logic ────────────────────────────────────────
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimer(OTP_EXPIRY_SECONDS);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  // ─── OTP input handlers ─────────────────────────────────
  const handleOtpChange = (index, value) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (pasted) {
      const newOtp = Array(OTP_LENGTH).fill("");
      pasted.split("").forEach((ch, i) => {
        newOtp[i] = ch;
      });
      setOtp(newOtp);
      // Focus last filled or last input
      const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
      otpRefs.current[focusIdx]?.focus();
    }
  };

  const otpValue = otp.join("");

  // ─── Notification helpers ───────────────────────────────
  const showSuccess = (msg, desc) =>
    api.success({
      message: msg,
      description: desc,
      placement: "topRight",
      duration: 3,
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      style: {
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(82, 196, 26, 0.15)",
        border: "1px solid #b7eb8f",
      },
    });

  const showError = (msg, desc) =>
    api.error({
      message: msg,
      description: desc,
      placement: "topRight",
      duration: 4,
      icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
      style: {
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(255, 77, 79, 0.15)",
        border: "1px solid #ffccc7",
      },
    });

  const showWarning = (msg, desc) =>
    api.warning({
      message: msg,
      description: desc,
      placement: "topRight",
      duration: 4,
      icon: <WarningOutlined style={{ color: "#faad14" }} />,
      style: {
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(250, 173, 20, 0.15)",
        border: "1px solid #ffe58f",
      },
    });

  // ─── API: Request OTP ───────────────────────────────────
  const handleRequestOtp = async (values) => {
    const trimmedEmail = values.email.trim();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/forgot-password", {
        email: trimmedEmail,
      });

      if (res.data?.success) {
        setEmail(trimmedEmail);
        setStep(2);
        startTimer();
        setOtp(Array(OTP_LENGTH).fill(""));
        showSuccess(
          "Gửi OTP thành công!",
          res.data.message || "Vui lòng kiểm tra hộp thư email.",
        );
        // Auto-focus first OTP input after render
        setTimeout(() => otpRefs.current[0]?.focus(), 300);
      } else {
        showError(
          "Gửi OTP thất bại",
          res.data?.message || "Vui lòng thử lại sau.",
        );
      }
    } catch (err) {
      const msg = err.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      if (msg.includes("không tồn tại") || msg.includes("chưa được đăng ký")) {
        showWarning(
          "Email không tồn tại",
          "Email chưa được đăng ký trong hệ thống.",
        );
      } else {
        showError("Gửi OTP thất bại", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── API: Resend OTP ────────────────────────────────────
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      if (res.data?.success) {
        startTimer();
        setOtp(Array(OTP_LENGTH).fill(""));
        showSuccess(
          "Đã gửi lại OTP!",
          res.data.message || "Vui lòng kiểm tra hộp thư.",
        );
        setTimeout(() => otpRefs.current[0]?.focus(), 300);
      } else {
        showError("Gửi lại thất bại", res.data?.message || "Vui lòng thử lại.");
      }
    } catch (err) {
      showError("Gửi lại thất bại", err.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  // ─── API: Reset Password ───────────────────────────────
  const handleResetPassword = async (values) => {
    // Validate OTP filled
    if (otpValue.length !== OTP_LENGTH) {
      showWarning("Chưa nhập đủ OTP", "Vui lòng nhập đủ 6 chữ số OTP.");
      return;
    }

    // Validate password match
    if (values.newPassword !== values.confirmPassword) {
      showWarning("Mật khẩu không khớp", "Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/reset-password", {
        email,
        otp: otpValue,
        newPassword: values.newPassword,
      });

      if (res.data?.success) {
        clearInterval(timerRef.current);
        setSuccess(true);
        showSuccess(
          "Đặt lại mật khẩu thành công!",
          res.data.message || "Bạn có thể đăng nhập với mật khẩu mới.",
        );
        // Auto redirect
        setTimeout(() => navigate("/login", { replace: true }), REDIRECT_DELAY);
      } else {
        showError("Đặt lại thất bại", res.data?.message || "Vui lòng thử lại.");
      }
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("không chính xác")) {
        showError(
          "OTP không chính xác",
          "Kiểm tra lại email hoặc gửi lại mã mới.",
        );
      } else if (msg.includes("hết hạn")) {
        showWarning("Mã OTP đã hết hạn", "Vui lòng gửi lại mã OTP mới.");
      } else if (msg.includes("ít nhất 6 ký tự")) {
        showWarning(
          "Mật khẩu quá ngắn",
          "Mật khẩu mới phải có ít nhất 6 ký tự.",
        );
      } else {
        showError("Đặt lại thất bại", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Password strength ─────────────────────────────────
  const strength = getPasswordStrength(passwordValue);

  // ─── Render: Success ────────────────────────────────────
  if (success) {
    return (
      <>
        {contextHolder}
        <div className="forgot-password-container">
          <div className="forgot-password-box">
            <div className="fp-success-card">
              <div className="success-icon">
                <CheckCircleOutlined />
              </div>
              <h2>Đặt lại mật khẩu thành công!</h2>
              <p>Bạn sẽ được chuyển đến trang đăng nhập trong vài giây...</p>
              <Button
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                block
                onClick={() => navigate("/login", { replace: true })}
                style={{
                  height: 45,
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 10,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                }}
              >
                Đăng nhập ngay
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── Render: Steps ──────────────────────────────────────
  return (
    <>
      {contextHolder}
      <div className="forgot-password-container">
        <div className="forgot-password-box">
          {/* Step Indicator */}
          <div className="fp-steps">
            <div className={`fp-step-dot ${step === 1 ? "active" : "done"}`}>
              {step > 1 ? <CheckCircleOutlined /> : "1"}
            </div>
            <div className={`fp-step-line ${step > 1 ? "active" : ""}`} />
            <div className={`fp-step-dot ${step === 2 ? "active" : ""}`}>2</div>
          </div>

          {/* Icon */}
          <div className="forgot-password-icon">
            <div className="icon-circle">
              {step === 1 ? <MailOutlined /> : <SafetyOutlined />}
            </div>
          </div>

          {/* Title */}
          <h1 className="forgot-password-title">
            {step === 1 ? "Quên mật khẩu" : "Xác nhận & Đặt lại"}
          </h1>
          <p className="forgot-password-subtitle">
            {step === 1
              ? "Nhập email để nhận mã OTP gồm 6 chữ số"
              : "Nhập mã OTP và mật khẩu mới của bạn"}
          </p>

          {/* ─── Step 1: Email ────────────── */}
          {step === 1 && (
            <Form
              form={form}
              name="forgot-step1"
              onFinish={handleRequestOtp}
              autoComplete="off"
              layout="vertical"
            >
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "⚠️ Vui lòng nhập email!" },
                  { type: "email", message: "⚠️ Email không hợp lệ!" },
                ]}
                validateTrigger={["onChange", "onBlur"]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Nhập email đã đăng ký"
                  size="large"
                  id="forgot-email-input"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  id="send-otp-button"
                  style={{
                    height: 45,
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 10,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                  }}
                >
                  Gửi mã OTP
                </Button>
              </Form.Item>
            </Form>
          )}

          {/* ─── Step 2: OTP + New Password ─ */}
          {step === 2 && (
            <Form
              name="forgot-step2"
              onFinish={handleResetPassword}
              autoComplete="off"
              layout="vertical"
            >
              {/* Email display */}
              <div className="email-display-chip">
                <MailOutlined />
                <span>{email}</span>
              </div>

              {/* OTP inputs */}
              <Form.Item label="Mã OTP" required>
                <div className="otp-input-group" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className={`otp-single-input ${digit ? "filled" : ""}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      id={`otp-input-${idx}`}
                    />
                  ))}
                </div>
              </Form.Item>

              {/* Timer */}
              <div
                className={`otp-timer-badge ${timer === 0 ? "expired" : ""}`}
              >
                <ClockCircleOutlined />
                {timer > 0
                  ? `Mã OTP có hiệu lực: ${formatTime(timer)}`
                  : "Mã OTP đã hết hạn"}
              </div>

              {/* Resend */}
              <div className="resend-otp-wrapper">
                <Button
                  type="link"
                  icon={<ReloadOutlined />}
                  onClick={handleResendOtp}
                  loading={loading}
                  id="resend-otp-button"
                >
                  Gửi lại mã OTP
                </Button>
              </div>

              {/* New Password */}
              <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                  { required: true, message: "⚠️ Vui lòng nhập mật khẩu mới!" },
                  { min: 6, message: "⚠️ Mật khẩu phải có ít nhất 6 ký tự!" },
                ]}
                validateTrigger={["onChange", "onBlur"]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  size="large"
                  id="new-password-input"
                  onChange={(e) => setPasswordValue(e.target.value)}
                />
              </Form.Item>

              {/* Password strength */}
              {passwordValue && (
                <div className="password-strength">
                  <div className="password-strength-bar">
                    {[1, 2, 3].map((seg) => (
                      <div
                        key={seg}
                        className={`bar-segment ${
                          strength.level >= seg
                            ? strength.level === 1
                              ? "weak"
                              : strength.level === 2
                                ? "medium"
                                : "strong"
                            : ""
                        }`}
                      />
                    ))}
                  </div>
                  <span className="password-strength-text">
                    Độ mạnh: {strength.text}
                  </span>
                </div>
              )}

              {/* Confirm Password */}
              <Form.Item
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "⚠️ Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("⚠️ Mật khẩu xác nhận không khớp!"),
                      );
                    },
                  }),
                ]}
                validateTrigger={["onChange", "onBlur"]}
              >
                <Input.Password
                  prefix={<KeyOutlined />}
                  placeholder="Nhập lại mật khẩu mới"
                  size="large"
                  id="confirm-password-input"
                />
              </Form.Item>

              {/* Submit */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  id="reset-password-button"
                  style={{
                    height: 45,
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 10,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                  }}
                >
                  Đặt lại mật khẩu
                </Button>
              </Form.Item>

              {/* Back to step 1 */}
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => {
                    setStep(1);
                    clearInterval(timerRef.current);
                    setOtp(Array(OTP_LENGTH).fill(""));
                    setPasswordValue("");
                  }}
                  style={{ color: "#888" }}
                >
                  Quay lại nhập email
                </Button>
              </div>
            </Form>
          )}

          {/* Footer */}
          <div className="forgot-password-footer">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
            >
              <ArrowLeftOutlined style={{ marginRight: 6 }} />
              Quay lại đăng nhập
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
