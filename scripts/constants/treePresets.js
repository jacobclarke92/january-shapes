export const defaultVars = {
	initBranchWidth: 30,
	initBranchHeight: 30,
	minBranchWidth: 4,
	minBranchHeight: 5,
	branchTaper: 0.8,
	branchTrim: 0.6,
	branchLean: 0.2,
	branchOverlap: 0.65,

	minSplitAngle: 0.1,
	maxSplitAngle: 0.5,

	maxBranches: 4200,
	splitProbability: 0.14,
	pruneProbability: 0.05,
	splitToLifeRatio: 0.1,
	maxSegments: 500,

	windSpeed: 0.005,
	initWindForce: 0.003,
};

export default {
	preset: 'Default',
	closed: false,
	remembered: {
		Default: {0: defaultVars},
		Shrub: {0: Object.assign({}, defaultVars, {
			initBranchWidth: 25,
			minBranchWidth: 2,
			branchTaper: 0.85,
			branchLean: 0.1,
			
			maxBranches: 2200,
			minSplitAngle: 0,
			maxSplitAngle: 0.1,
			splitToLifeRatio: 0.02,
			splitProbability: 0.08,
			initWindForce: 0.0001,
		})},
		Angular: {0: Object.assign({}, defaultVars, {
			maxBranches: 2200,
			minSplitAngle: Math.PI/4,
			maxSplitAngle: Math.PI/4,
			splitToLifeRatio: 0.02,
			branchLean: 0,
			splitProbability: 0.12,
			initWindForce: 0.00001,
		})},
		Wirey: {0: Object.assign({}, defaultVars, {
			maxBranches: 2000,
			minBranchWidth: 3,
			initBranchHeight: 25,
			branchTaper: 0.35,

			maxSegments: 180,
			maxSplitAngle: 0.2,
			splitProbability: 0.035,
			splitToLifeRatio: 0.001,
			initWindForce: 0,
			windSpeed: 0,
		})}
	}
}