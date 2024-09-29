import React, { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import { Audio } from "expo-av";

export default function HomeScreen() {
  const [recording, setRecording] = useState<Audio.Recording | undefined>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const startRecording = async () => {
    try {
      if (permissionResponse?.status !== "granted") {
        console.log("Getting permission...");
        await requestPermission();
      }
      console.log("Starting recording...");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  };

  const stopRecording = async () => {
    console.log("Stopping recording...");
    if (!recording) {
      return;
    }
    try {
      await recording.stopAndUnloadAsync();
      console.log(recording);
      const uri = recording.getURI();
      setRecordingUri(uri);
      console.log("Recording stopped and stored at", uri);
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
    setRecording(undefined);
  };

  const playSound = async () => {
    if (!recordingUri) {
      console.log("No recording to play");
      return;
    }
    console.log("Loading Sound");
    try {
      console.log(recording);
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      setSound(sound);
      console.log("Playing Sound");
      await sound.playAsync();
    } catch (error) {
      console.error("Failed to play sound", error);
    }
  };

  const stopSound = async () => {
    if (!sound) {
      console.log("No sound to stop");
      return;
    }
    try {
      await sound.unloadAsync();
      console.log("Sound stopped");
    } catch (error) {
      console.error("Failed to stop sound", error);
    }
    setSound(null);
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button
        title={recording ? "Stop Recording" : "Start Recording"}
        onPress={recording ? stopRecording : startRecording}
      />
      {permissionResponse && (
        <Text>Microphone Permission: {permissionResponse.status}</Text>
      )}
      <Button
        title="Play Recording"
        onPress={playSound}
        disabled={!recordingUri}
      />
      <Button
        title="Stop Recording"
        onPress={stopSound}
        disabled={!recordingUri}
      />
    </View>
  );
}
