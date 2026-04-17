import { Profile } from "../types/profile";

type Props = {
  profile: Profile;
};

export default function ProfileHeader({ profile }: Props) {
  return (
    <div
      style={{
        background: "#05070c",
        border: "1px solid rgba(80, 140, 255, 0.14)",
        borderRadius: 20,
        overflow: "hidden",
        color: "#fff",
        boxShadow: "0 0 24px rgba(0, 80, 255, 0.08)",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 190,
          background: profile.bannerUrl
            ? `linear-gradient(rgba(3, 6, 14, 0.3), rgba(3, 6, 14, 0.6)), url(${profile.bannerUrl}) center/cover no-repeat`
            : "linear-gradient(135deg, #04060b 0%, #0a1324 35%, #102347 68%, #05070c 100%)",
          borderBottom: "1px solid rgba(80, 140, 255, 0.14)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(5, 7, 12, 0.95) 0%, rgba(5, 7, 12, 0.35) 38%, rgba(5, 7, 12, 0.08) 100%)",
            pointerEvents: "none",
          }}
        />
      </div>

      <div
        style={{
          padding: "0 20px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 18,
            alignItems: "flex-end",
            flexWrap: "wrap",
            marginTop: -54,
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: 108,
              height: 108,
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #05070c",
              background:
                "radial-gradient(circle at 30% 30%, #16315f 0%, #0b1730 38%, #05070c 82%)",
              boxShadow:
                "0 0 0 2px rgba(80, 140, 255, 0.2), 0 0 20px rgba(80, 140, 255, 0.25)",
              flexShrink: 0,
            }}
          >
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={`${profile.displayName} avatar`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 34,
                  fontWeight: 700,
                  color: "#b7d2ff",
                  letterSpacing: "0.02em",
                }}
              >
                {profile.displayName?.charAt(0)?.toUpperCase() || "M"}
              </div>
            )}
          </div>

          <div
            style={{
              flex: 1,
              minWidth: 220,
              paddingBottom: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: 28,
                  lineHeight: 1.1,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                {profile.displayName}
              </h1>

              {profile.isCreator && (
                <span
                  style={{
                    fontSize: 12,
                    padding: "5px 10px",
                    borderRadius: 999,
                    background: "rgba(80, 140, 255, 0.12)",
                    border: "1px solid rgba(80, 140, 255, 0.25)",
                    color: "#9fc2ff",
                    boxShadow: "0 0 12px rgba(80, 140, 255, 0.08)",
                  }}
                >
                  Creator
                </span>
              )}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 15,
                color: "rgba(180, 210, 255, 0.78)",
              }}
            >
              @{profile.username}
            </div>
          </div>
        </div>

        {profile.status && (
          <div
            style={{
              marginTop: 18,
              padding: "11px 14px",
              borderRadius: 14,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
              border: "1px solid rgba(255,255,255,0.06)",
              fontSize: 14,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            <strong style={{ color: "#ffffff" }}>Status:</strong>{" "}
            <span style={{ color: "rgba(255,255,255,0.92)" }}>
              {profile.status}
            </span>
          </div>
        )}

        {profile.bio && (
          <p
            style={{
              margin: "16px 0 0 0",
              lineHeight: 1.65,
              fontSize: 15,
              color: "rgba(255,255,255,0.92)",
              maxWidth: 760,
            }}
          >
            {profile.bio}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 18,
            fontSize: 14,
          }}
        >
          {profile.discordHandle && (
            <span
              style={{
                padding: "9px 12px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.88)",
              }}
            >
              Discord: {profile.discordHandle}
            </span>
          )}

          <span
            style={{
              padding: "9px 12px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.88)",
            }}
          >
            Mode: {profile.themeMode}
          </span>

          <span
            style={{
              padding: "9px 12px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.88)",
            }}
          >
            Points: {profile.points}
          </span>
        </div>
      </div>
    </div>
  );
}