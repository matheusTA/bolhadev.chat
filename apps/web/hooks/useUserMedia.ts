import { useCallback, useEffect, useMemo, useState } from "react";

type MediaConstraints = {
  audio: string;
  video: string;
};

export const useUserMedia = (video: HTMLVideoElement) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState("");
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("");

  const getDevices = useCallback(async () => {
    try {
      return await navigator.mediaDevices.enumerateDevices();
    } catch (error) {
      console.error("Error fetching devices:", error);
      return null;
    }
  }, []);

  const initMedia = useCallback(
    async (video: HTMLVideoElement, constraints: MediaConstraints) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: constraints.video } },
        audio: {
          deviceId: {
            exact:
              "0f481a2672954ca783c56482d03893d1f41a1ead034ed3be1523bb8ecf14d2db",
          },
        },
      });

      if (video) {
        video.srcObject = stream;
        video.play();
      }
    },
    [],
  );

  useEffect(() => {
    const init = async () => {
      const devices = await getDevices();
      if (!devices) return;

      setDevices(devices);

      const audioInput = devices.find((device) => device.kind === "audioinput");
      const videoInput = devices.find((device) => device.kind === "videoinput");

      if (!audioInput?.deviceId || !videoInput?.deviceId) return;

      setSelectedAudioDevice(audioInput?.deviceId);
      setSelectedVideoDevice(videoInput?.deviceId);

      initMedia(video, {
        audio: audioInput.deviceId,
        video: audioInput.deviceId,
      });
    };

    init();
  }, []);

  useEffect(() => {
    initMedia(video, {
      audio: selectedAudioDevice,
      video: selectedVideoDevice,
    });
  }, [selectedAudioDevice, selectedVideoDevice]);

  const audioDevices = useMemo(() => {
    return devices.filter((device) => device.kind === "audioinput");
  }, [devices]);

  const videoDevices = useMemo(() => {
    return devices.filter((device) => device.kind === "videoinput");
  }, [devices]);

  return {
    audioDevices,
    videoDevices,
    selectedAudioDevice,
    setSelectedAudioDevice,
    selectedVideoDevice,
    setSelectedVideoDevice,
  };
};