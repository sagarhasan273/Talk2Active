// types/ice-servers.types.ts

export interface XirsysIceServer {
  urls: string[];
  username: string;
  credential: string;
}

export interface IceServersResponse {
  status: boolean;
  iceServers: XirsysIceServer[];
  iceCandidatePoolSize: number;
}
