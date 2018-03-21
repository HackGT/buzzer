export interface SourceOptions {
	[key: string]: string[]; // Legal values for given key
}

export interface SourceReturn {
	error: string;
	targets: any[];
} // Possible user object generic? seems like info provided by plugin, separate concern from serverside typing

export interface Source {
	options(): Promise<SourceOptions>;
	filter(filterDict: SourceOptions): Promise<SourceReturn>;
}
