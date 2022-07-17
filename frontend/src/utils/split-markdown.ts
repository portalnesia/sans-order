import {load} from 'js-yaml'

export default function splitMarkdown<D=Record<string,any>>(source: string): ({data: string,meta?: D}) {
	if (source.slice(0, 3) !== '---') return {data:source};

	var matcher = /\n(\.{3}|-{3})/g;
	var metaEnd = matcher.exec(source);
    let meta: D|undefined;
    if(metaEnd !== null) {
        meta = load(source.slice(0, metaEnd.index)) as D;
    }
	return {meta,data:source.slice(matcher.lastIndex)}
}