const axios = require('axios');
const _ = require('lodash');

const configurations = {
	readAPIUrl:  'http://norvig.com/big.txt',
	lookupAPIUrl: 'https://dictionary.yandex.net/api/v1/dicservice.json/lookup',
	language: 'en-en',
	apiKey: 'dict.1.1.20210216T114936Z.e4989dccd61b9626.373cddfbfb8a3b2ff30a03392b4e0b076f14cff9'
};

async function getAPICall(apiURL) {
	try {
		const res = await axios.get(apiURL);
		return res.data;
	} catch (exception){
		console.error(exception);
	}	
}

async function init() {
	const responseData = await getAPICall(configurations.readAPIUrl);	
	const words = _.words(responseData);
	const topTenWords = getTopTenWords(words);
	const topTenWordsCount = topTenWords.length;
	var outputArray = [];
	
	for (var t=0; t < topTenWordsCount; t++){
		const serachKeyword = topTenWords[t];
		const lookupResults = await getLookupValue(serachKeyword.key);
		const synonyms = getSynonyms(lookupResults.def);
		
		outputArray.push({
			text: serachKeyword.key,
			countOfOccurrenceInThatParticularDocument: serachKeyword.value,
			synonyms: _.join(synonyms, ','),
			pos: lookupResults && lookupResults.def && lookupResults.def.length > 0 ? lookupResults.def[0].pos : ''
		});
	}
	console.table(outputArray);
 }
 function getTopTenWords(words) {	
	const groupWords = _.groupBy(words, word => {
		const value = word ? word.trim() : '';
		if (value && value.length > 0) {
			return value;
		}
	});	
	const groupWordsKeys = Object.keys(groupWords);
	const groupWordsKeysCount = groupWordsKeys.length;
	var groupWordsList = [];
	
	for (var i=0; i < groupWordsKeysCount; i++){
		if (groupWordsKeys[i]) {
			groupWordsList.push({key: groupWordsKeys[i], value: groupWords[groupWordsKeys[i]].length});
		}
	} 
	const groupWordsListSort = _.orderBy(groupWordsList, 'value', 'desc');
	const groupWordsListSplit =_.chunk(groupWordsListSort, 10);

	return groupWordsListSplit && groupWordsListSplit.length > 0 ? groupWordsListSplit[0] : [];
 }
 function getSynonyms(def) {
	var synonyms = [];
	const defList = def && def.length ? def[0].tr : [];
	const defListCount = defList.length;

	for (var i=0; i < defListCount; i++){ 
		synonyms.push(defList[i].text); 
	}

	return synonyms;
}
async function getLookupValue(searchKeyword) {
	const apiUrl = `${configurations.lookupAPIUrl}?key=${configurations.apiKey}&lang=${configurations.language}&text=${searchKeyword}`;
	return await getAPICall(apiUrl);
}

init();