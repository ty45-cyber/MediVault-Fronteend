// Update MEDIVAULT_ADDRESS after deployment
export const MEDIVAULT_ADDRESS = "0x0000000000000000000000000000000000000000";

export const MEDIVAULT_ABI = [
  // Profile Management
  "function registerProfile(bytes32 einputAge, bytes32 einputCondition, bytes32 einputBiomarker, bytes32 einputRegion, bytes calldata proofAge, bytes calldata proofCondition, bytes calldata proofBiomarker, bytes calldata proofRegion) external",
  "function updateProfile(bytes32 einputAge, bytes32 einputCondition, bytes32 einputBiomarker, bytes32 einputRegion, bytes calldata proofAge, bytes calldata proofCondition, bytes calldata proofBiomarker, bytes calldata proofRegion) external",
  "function deleteProfile() external",
  "function hasProfile(address patient) external view returns (bool)",
  "function getPatientRequests(address patient) external view returns (bytes32[] memory)",

  // Trial Management
  "function registerTrial(bytes32 trialId, bytes32 einputMinAge, bytes32 einputMaxAge, bytes32 einputConditionCode, bytes32 einputMinBiomarker, bytes32 einputMaxBiomarker, bytes32 einputRegion, bytes calldata proofMinAge, bytes calldata proofMaxAge, bytes calldata proofCondition, bytes calldata proofMinBiomarker, bytes calldata proofMaxBiomarker, bytes calldata proofRegion, bool requiresRegionMatch, uint256 maxParticipants, string calldata metadataURI) external",
  "function deactivateTrial(bytes32 trialId) external",
  "function getTrialPublicInfo(bytes32 trialId) external view returns (address sponsor, uint256 maxParticipants, uint256 currentMatches, uint256 createdAt, bool active, string memory metadataURI)",
  "function getActiveTrialIds() external view returns (bytes32[] memory)",

  // Matching
  "function requestEligibilityCheck(bytes32 trialId) external",
  "function recordVerifiedMatch(bytes32 trialId, address patient) external",
  "function getMatchRequest(uint256 requestId) external view returns (address patient, bytes32 trialId, uint256 requestedAt, bool resolved)",
  "function hasRequestedMatch(address patient, bytes32 trialId) external view returns (bool)",

  // Events
  "event ProfileRegistered(address indexed patient, uint256 consentVersion, uint256 timestamp)",
  "event ProfileDeleted(address indexed patient, uint256 timestamp)",
  "event TrialRegistered(bytes32 indexed trialId, address indexed sponsor, string metadataURI)",
  "event MatchRequested(uint256 indexed requestId, address indexed patient, bytes32 indexed trialId)",
  "event MatchResolved(uint256 indexed requestId, address indexed patient, bytes32 indexed trialId)",
];