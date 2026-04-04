import { Profile } from "../types/profile";

type Props = {
  profile: Profile;
};

export default function ProfileHeader({ profile }: Props) {
  return (
    <div
      style={{
        background: "#0b0b0f",
        border: "1px solid rgba(80, 140, 255, 0.14)",
        borderRadius: 20,
        overflow: "hidden",
        color: "#fff",
        boxShadow: "0 0 24px rgba(0, 80, 255, 0.08)",
      }}
    >
      <div
        style={{
          height: 180,
          background: profile.bannerUrl
            ? `url(${profile.bannerUrl}) center/cover no-repeat`
            : "linear-gradient(135deg, #08111f 0%, #0d1b34 50%, #05070c 100%)",
          borderBottom: "1px solid rgba(80, 140, 255, 0.14)",
        }}
      />

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
            marginTop: -44,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #0b0b0f",
              background: "#11161f",
              boxShadow: "0 0 18px rgba(80, 140, 255, 0.18)",
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
            ) : null}
          </div>

          <div
            style={{
              flex: 1,
              minWidth: 220,
              paddingBottom: 4,
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
                  }}
                >
                  Creator
                </span>
              )}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 14,
                opacity: 0.72,
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
              padding: "10px 12px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              fontSize: 14,
            }}
          >
            <strong style={{ opacity: 0.85 }}>Status:</strong> {profile.status}
          </div>
        )}

        {profile.bio && (
          <p
            style={{
              margin: "16px 0 0 0",
              lineHeight: 1.6,
              fontSize: 15,
              opacity: 0.92,
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
            opacity: 0.82,
          }}
        >
          {profile.discordHandle && (
            <span
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              Discord: {profile.discordHandle}
            </span>
          )}

          <span
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            Mode: {profile.themeMode}
          </span>

          <span
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            Points: {profile.points}
          </span>
        </div>
      </div>
    </div>
  );
}