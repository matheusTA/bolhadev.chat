import { useCallback, useEffect, useMemo, useState } from "react";

type MediaConstraints = {
  audio: string;
  video: string;
};

export const useUserMedia = (video: HTMLVideoElement) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState("");
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("");
  const [ready, setReady] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

  const getDevices = useCallback(async () => {
    try {
      return await navigator.mediaDevices.enumerateDevices();
    } catch (error) {
      console.error("Error fetching devices:", error);
      return null;
    }
  }, []);

  const updateUserMedia = useCallback(
    async (video: HTMLVideoElement, constraints: MediaConstraints) => {
      console.log("requestAccess");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: constraints.video
          ? { deviceId: { exact: constraints.video } }
          : true,
        audio: constraints.audio
          ? { deviceId: { exact: constraints.audio } }
          : true,
      });

      console.log({ stream });

      if (video) {
        video.srcObject = stream;
        video.play();
        setAccessGranted(true);
      }

      setReady(true);
    },
    [setReady],
  );

  const getDevices = useCallback(async () => {
    const devices = await getDevices();
    setDevices(devices || []);
  }, []);

  useEffect(() => {
    getDevices();
  }, [accessGranted]);

  useEffect(() => {
    const init = async () => {
      let audioInput;
      let videoInput;
      const devices = await getDevices();
      if (devices) {
        setDevices(devices);

        audioInput = devices.find((device) => device.kind === "audioinput");
        videoInput = devices.find((device) => device.kind === "videoinput");

        if (audioInput?.deviceId! && videoInput?.deviceId) {
          setSelectedAudioDevice(audioInput?.deviceId);
          setSelectedVideoDevice(videoInput?.deviceId);

          updateUserMedia(video, {
            audio: audioInput.deviceId,
            video: audioInput.deviceId,
          });
        }
      }

      updateUserMedia(video, {
        audio: "",
        video: "",
      });
    };

    init();
  }, []);

  useEffect(() => {
    if (!selectedAudioDevice || !selectedAudioDevice) return;
    updateUserMedia(video, {
      audio: selectedAudioDevice,
      video: selectedVideoDevice,
    });
  }, [selectedAudioDevice, selectedVideoDevice]);

  const audioDevices = useMemo(() => {
    return devices.filter(
      (device) => device.kind === "audioinput" && !!device.deviceId,
    );
  }, [devices]);

  const videoDevices = useMemo(() => {
    return devices.filter(
      (device) => device.kind === "videoinput" && !!device.deviceId,
    );
  }, [devices]);

  console.log({ devices });

  return {
    audioDevices,
    videoDevices,
    selectedAudioDevice,
    setSelectedAudioDevice,
    selectedVideoDevice,
    setSelectedVideoDevice,
    ready,
    accessGranted,
  };
};
