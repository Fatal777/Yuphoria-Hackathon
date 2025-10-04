import { useParams } from "react-router-dom";
import { VideoCallModal } from "@/components/VideoCallModal";

export const VideoCallPage = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const userId = `user_${Date.now()}`;

  if (!tutorId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Invalid tutor ID</p>
      </div>
    );
  }

  return (
    <VideoCallModal
      companionId={tutorId}
      companionName="AI Tutor"
      userId={userId}
    />
  );
};
