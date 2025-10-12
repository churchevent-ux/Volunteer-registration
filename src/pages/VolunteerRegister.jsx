import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";
import Logo from "../images/church logo2.png";
import Logo2 from "../images/church logo2.png";
import Logo3 from "../images/logo2.png";

const VolunteerRegister = () => {
  const navigate = useNavigate();
  const [ageError, setAgeError] = useState("");


  /** ---------------------------
   * 1. Form State
   * --------------------------- */
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    age: "",
    email: "",
    phone: "",
    preferredRole: "",
    preferredLocation: "",
    tshirtSize: "",
    emergencyName: "",
    emergencyPhone: "",
    availableDates: [],
    volunteerAgreement: false,
    signature: "",
    priorExperience: "", // <-- new field
  });
  


  /** ---------------------------
   * 2. Responsive
   * --------------------------- */
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /** ---------------------------
   * 3. Auto-calculate Age
   * --------------------------- */
  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let ageNow = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        ageNow--;
      }
  
      setFormData((prev) => ({ ...prev, age: ageNow.toString() }));
  
      // Minimum age check
      if (ageNow < 12) {
        setAgeError("Sorry, volunteers must be at least 12 years old to participate.");
      } else {
        setAgeError(""); // clear error if age is valid
      }
    } else {
      setFormData((prev) => ({ ...prev, age: "" }));
      setAgeError("");
    }
  }, [formData.dob]);
  
  

  /** ---------------------------
   * 4. Handlers
   * --------------------------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const toggleDate = (date) => {
    setFormData((prev) => {
      const exists = prev.availableDates.includes(date);
      return {
        ...prev,
        availableDates: exists
          ? prev.availableDates.filter((d) => d !== date)
          : [...prev.availableDates, date],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Minimum age check
    if (parseInt(formData.age) < 12) {
      return; // stops submission if age is below 12
    }
  
    try {
      const volRef = collection(db, "volunteers");
  
      // Generate a unique volunteer ID
      const newId = `Volunteer-${Date.now()}`;
      const dataToSave = { ...formData, volunteerId: newId, createdAt: new Date() };
  
      // Save to Firestore
      await addDoc(volRef, dataToSave);
  
      // Navigate to volunteer ID page with data
      navigate("/volunteer-id", { state: { formData: dataToSave } });
    } catch (err) {
      console.error("Error adding volunteer:", err);
      alert("Failed to register. Check console for details.");
    }
  };
  

  /** ---------------------------
   * 5. Constants
   * --------------------------- */
  const eventDates = ["2025-12-28", "2025-12-29", "2025-12-30"];

  const rolesByCategory = {
    "Front of House": ["Ushering", "Greeter", "Welcome Desk"],
    "Guest Support": ["Food Service", "Water Station", "Hospitality"],
    "Operations": ["Tech Support (Audio/Video)", "Stage Crew", "Logistics"],
  };

  const eventLocations = [
    "Main Auditorium",
    "Outdoor Stage",
    "Kids Activity Zone",
    "Parking & Traffic",
    "Registration Desk",
    "Backstage / Green Room",
  ];

  /** ---------------------------
   * 6. Layout
   * --------------------------- */
  return (
    <div
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        background: "linear-gradient(135deg,#fdfbfb,#ebedee)",
        padding: "20px 10px",
        width: "100%",
        minHeight: "100vh",
      }}
    >
      {/* Floating Login Button */}
      {/* <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 999,
        }}
      >
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: "bold",
            backgroundColor: "#2980b9",
            color: "#fff",
            border: "none",
            borderRadius: 20,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
         Register
        </button>
      </div> */}

      {/* Header */}
      <Header isMobile={isMobile} />

      {/* Form */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 10px" }}>
        <form
          onSubmit={handleSubmit}
          style={{ maxWidth: "850px", margin: "0 auto" }}
        >
          <Card title="🙋‍♀️ Volunteer Information">
            <Input
              label="Full Name (in capital letters)"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
              <Input
                label="Date of Birth"
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
              <Input
                label="Age"
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                readOnly
              />
              {ageError && (
  <div style={{ color: "red", fontSize: "13px", marginTop: "-10px",paddingBottom:"5px" }}>
    {ageError}
  </div>
)}
            </div>
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          <Input
  label="Phone Number"
  name="phone"
  value={formData.phone}
  onChange={handleChange}
  required
  pattern="^(?:\+971|0)?5\d{8}$"
  title="Enter a valid UAE phone number (e.g., 0501234567)"
/>

            {/* Preferred Role */}
            <div style={{ marginBottom: 15 }}>
              <label style={inputLabel}>Preferred Role</label>
              <select
                name="preferredRole"
                value={formData.preferredRole}
                onChange={handleChange}
                required
                style={selectStyle}
              >
                <option value="">-- Select a Role --</option>
                {Object.entries(rolesByCategory).map(([group, roles]) => (
                  <optgroup key={group} label={group}>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>



            <div style={{ marginBottom: 15 }}>
  <label style={inputLabel}> Have you volunteered or participated in similar events before?</label>
  <select
    name="priorExperience"
    value={formData.priorExperience}
    onChange={handleChange}
    required
    style={selectStyle}
  >
    <option value="">-- Select an option --</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
</div>


            {/* Preferred Location */}
            <div style={{ marginBottom: 15 }}>
              <label style={inputLabel}>Preferred Location</label>
              <select
                name="preferredLocation"
                value={formData.preferredLocation}
                onChange={handleChange}
                required
                style={selectStyle}
              >
                <option value="">-- Select a Location --</option>
                {eventLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="T-Shirt Size (S / M / L / XL)"
              name="tshirtSize"
              value={formData.tshirtSize}
              onChange={handleChange}
            />
          </Card>

          <Card title="🚨 Emergency Contact">
            <Input
              label="Emergency Contact Name"
              name="emergencyName"
              value={formData.emergencyName}
              onChange={handleChange}
              required
            />
            <Input
              label="Emergency Contact Phone"
              name="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={handleChange}
              required
            />
          </Card>

          <Card title="📅 Date Availability">
            <p style={{ fontSize: 14, marginBottom: 10, color: "#444" }}>
              Please select all dates you are available to serve:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {eventDates.map((date) => (
                <label
                  key={date}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 14,
                    background: "#f9f9f9",
                    padding: "8px 12px",
                    borderRadius: 8,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.availableDates.includes(date)}
                    onChange={() => toggleDate(date)}
                  />
                  <span style={{ marginLeft: 10 }}>
                    {new Date(date).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </label>
              ))}
            </div>

            {/* Show selected dates */}
            {formData.availableDates.length > 0 && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px",
                  background: "#eafaf1",
                  border: "1px solid #2ecc71",
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                <strong>Selected Dates:</strong>{" "}
                {formData.availableDates
                  .map((d) =>
                    new Date(d).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  )
                  .join(", ")}
              </div>
            )}
          </Card>

          <Card title="🤝 Volunteer Agreement">
            <label
              style={{ fontSize: "14px", marginBottom: 12, display: "block" }}
            >
              <input
                type="checkbox"
                name="volunteerAgreement"
                checked={formData.volunteerAgreement}
                onChange={handleChange}
                required
              />{" "}
              I agree to abide by the guidelines of the Christeen Retreat and
              fulfill my duties responsibly.
            </label>
            <Input
              label="Signature"
              name="signature"
              value={formData.signature}
              onChange={handleChange}
              required
            />
          </Card>

          <Card title="📜 Important Notes">
            <ul
              style={{
                paddingLeft: 18,
                lineHeight: 1.6,
                fontSize: "14px",
                color: "#444",
              }}
            >
              <li>Volunteers must be 16 years or older.</li>
              <li>Arrive at least 30 minutes before your shift.</li>
              <li>Wear your volunteer badge and the provided t-shirt.</li>
              <li>Contact Volunteer Coordinators for any schedule changes.</li>
            </ul>
          </Card>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "15px",
              fontWeight: "bold",
              backgroundColor: "#6c3483",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              marginTop: 15,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              transition: "background 0.3s",
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = "#5b2c6f")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "#6c3483")
            }
          >
            ✨ Submit Volunteer Registration
          </button>
        </form>
      </div>
    </div>
  );
};

/** Shared Components & Styles */
const inputLabel = {
  fontWeight: "bold",
  marginBottom: 6,
  display: "block",
  fontSize: "14px",
  color: "#333",
};
const selectStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: "14px",
  boxSizing: "border-box",
};


const Header = () => (
  <div style={headerStyles.container}>
    <div style={headerStyles.wrapper}>
      {/* Left Logos */}
      <div style={headerStyles.left}>
        <img src={Logo} alt="Logo2" style={headerStyles.logo} />
        {/* <img src={Logo3} alt="Logo3" style={headerStyles.logo} /> */}
      </div>

      {/* Center Text */}
      <div
  style={{
    textAlign: "center",
    borderRadius: "18px",
    padding: "10px 20px",
    margin: "0 auto 10px",
    maxWidth: "650px",
  }}
>
  {/* Logo (Optional — add your logo image if available) */}
  {/* <img
    src={Logo}
    alt="Logo"
    style={{
      maxWidth: "100px",
      marginBottom: "15px",
    }}
  /> */}

  <h1
    style={{
      fontSize: "30px",
      color: "#5a2d82",
      textTransform: "uppercase",
      letterSpacing: "1px",
      fontWeight: "900",
      margin: "0 0 10px",
    }}
  >
    DEO GRATIAS – 2025
  </h1>

  <div
    style={{
      width: "70px",
      height: "4px",
      backgroundColor: "#5a2d82",
      borderRadius: "4px",
      margin: "12px auto 18px",
    }}
  ></div>

  <h2
    style={{
      fontSize: "20px",
      color: "#333",
      fontStyle: "italic",
      margin: "0 0 5px",
      fontWeight: "500",
    }}
  >
    Teens & Kids Retreat
  </h2>

  <p
    style={{
      fontSize: "15px",
      color: "#555",
      margin: "0 0 10px",
      letterSpacing: "0.3px",
    }}
  >
    (December 28th to 30th) – 3 Days
  </p>

  <h3
    style={{
      fontSize: "17px",
      color: "#2c3e50",
      fontWeight: "700",
      margin: "15px 0 5px",
    }}
  >
    St. Mary’s Church, Dubai
  </h3>

  <p
    style={{
      fontSize: "14px",
      color: "#777",
      margin: "0",
    }}
  >
    P.O. BOX: 51200, Dubai, U.A.E
  </p>
</div>


      {/* Right Logo */}
      <div style={headerStyles.right}>
        {/* <img src={Logo} alt="Logo" style={headerStyles.logo} /> */}
      </div>
    </div>
  </div>
);

const headerStyles = {
  container: {
    width: "100%",
    background: "rgba(255,255,255,0.95)",
    borderTop: "6px solid #6c3483",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    marginBottom: 20,
  },
  wrapper: {
    maxWidth: 1000,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    padding: 10,
    boxSizing: "border-box",
    gap: 15,
  },
  left: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignItems: "center",
  },
  right: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    textAlign: "center",
  },
  logo: {
    maxWidth: 180,
    height: "auto",
  },
  title: { margin: 0, fontSize: 18, color: "#2c3e50", textTransform: "uppercase" },
  subtitle: { margin: "5px 0", fontSize: 14, color: "#555" },
  text: { margin: "5px 0", fontSize: 12, color: "#666" },
  mainTitle: { marginTop: 5, fontSize: 18, color: "#8b0000", fontWeight: "bold" },
  subTitle: { margin: "5px 0", fontSize: 16, color: "#6c3483" },
  textItalic: { fontSize: 12, fontStyle: "italic", margin: "0 0 5px 0" },
};







const Card = ({ title, children }) => (
  <div
    style={{
      background: "#fff",
      padding: 20,
      marginBottom: 25,
      borderRadius: 12,
      boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      borderLeft: "4px solid #6c3483",
    }}
  >
    <h3
      style={{
        marginBottom: 15,
        fontSize: "16px",
        color: "#6c3483",
        borderBottom: "1px solid #eee",
        paddingBottom: 6,
      }}
    >
      {title}
    </h3>
    {children}
  </div>
);

const Input = ({ label, type = "text", ...props }) => (
  <div style={{ marginBottom: 15, flex: 1, minWidth: "220px" }}>
    <label style={inputLabel}>{label}</label>
    <input
      type={type}
      {...props}
      style={{
        width: "100%",
        padding: "10px",
        borderRadius: 8,
        border: "1px solid #ddd",
        transition: "border 0.3s",
        fontSize: "14px",
        boxSizing: "border-box",
      }}
      onFocus={(e) => (e.target.style.border = "1px solid #6c3483")}
      onBlur={(e) => (e.target.style.border = "1px solid #ddd")}
    />
  </div>
);

export default VolunteerRegister;
