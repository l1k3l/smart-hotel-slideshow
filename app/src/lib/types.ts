export interface WeatherData {
	location: string;
	alias: string;
	operationStatus: string;
	operatingHours: string;
	temp0700: number | null;
	weatherCode: number | null;
	weatherText: string;
	snowHeightSlopes: number | null;
	snowHeightMin: number | null;
	snowHeightMax: number | null;
	snowHeightOutside: number | null;
	snowNew: number | null;
	snowType: string;
	lastChange: string;
}

export interface Lift {
	id: string;
	name: string;
	type: string;
	status: string;
	statusCode: number;
	capacity: number | null;
}

export interface Slope {
	id: string;
	name: string;
	difficulty: string;
	difficultyCode: number;
	status: string;
	statusCode: number;
	length: number | null;
	elevation: number | null;
	snowmaking: boolean;
	nightSkiing: boolean;
}

export interface Webcam {
	id: string;
	name: string;
	altitude: number | null;
	temperature: number | null;
	imageUrl: string;
	imageWidth: number;
	imageHeight: number;
	videoUrl: string | null;
	videoFiles: { size: string; url: string; width: number; height: number }[];
	panoramicUrl: string | null;
	lastUpdate: string;
}

export interface ResortData {
	weather: WeatherData[];
	lifts: Lift[];
	slopes: Slope[];
	webcams: Webcam[];
	fetchedAt: string;
}
