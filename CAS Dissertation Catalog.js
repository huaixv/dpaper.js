{
	"translatorID": "395f30b8-6d6f-4985-a15a-bd88f15b8281",
	"label": "CAS Dissertation Catalog",
	"creator": "huaixv",
	"target": "http://dpaper.las.ac.cn",
	"minVersion": "5.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2025-02-12 08:59:21"
}

// web url
// "http://dpaper.las.ac.cn/Dpaper/detail/detailNew?paperID=xxx"
// "http://dpaper.las.ac.cn/Dpaper/search/searchResult?searchText=xxx"

// api url
// "http://dpaper.las.ac.cn/Dpaper/detail/detailDoc?paperID=xxx"

function detectWeb(doc, url) {
	var thesisRegx = /\/Dpaper\/detail\/detailNew\?paperID=/i;
	if (thesisRegx.test(url)) {
		return 'thesis';
	}
	var searchRegx = /\/Dpaper\/search\/searchResult\?/i;
	if (searchRegx.test(url) && getSearchResults(doc, true)) {
		return 'multiple';
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;

	var rows = doc.querySelectorAll('ul#searchShow > li');

	for (let row of rows) {
		let title = ZU.trimInternal(row.querySelector('div.hd > label > a').textContent);
		let paperId = row.querySelector('div.hd > label > input').value;
		let href = 'http://dpaper.las.ac.cn/Dpaper/detail/detailDoc?paperID=' + paperId;

		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}

	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return;
			}
			ZU.doGet(Object.keys(items), scrape);
		});
	}
	else {
		var paperId = url.match(/\/Dpaper\/detail\/detailNew\?paperID=(\d+)/i)[1];
		var jsonUrl = 'http://dpaper.las.ac.cn/Dpaper/detail/detailDoc?paperID=' + paperId;
		ZU.doGet(jsonUrl, scrape);
	}
}

function scrape(text) {
	var newItem = new Zotero.Item("thesis");

	var dpaperJson = JSON.parse(text);


	newItem.title = dpaperJson.title_cn;
	newItem.creators.push({
		lastName: dpaperJson.author_name,
		creatorType: "author",
		fieldMode: 1
	});
	if (dpaperJson.teacher_name) {
		for (const teacherName of dpaperJson.teacher_name) {
			newItem.creators.push({
				lastName: teacherName,
				creatorType: "contributor",
				fieldMode: 1
			});
		}
	}
	newItem.abstractNote = dpaperJson.abstract_cn;
	newItem.thesisType = dpaperJson.paper_type;
	newItem.university = dpaperJson.grant_institution;
	newItem.place = dpaperJson.training_institution[0];
	newItem.date = dpaperJson.education_grant_time_norm;
	newItem.numPages = dpaperJson.page_count;
	newItem.language = dpaperJson.language;
	// missing field: shortTitle
	newItem.url = 'http://dpaper.las.ac.cn/Dpaper/detail/detailNew?paperID=' + dpaperJson.paperID;
	// missing field: accessDate
	newItem.archive = dpaperJson.holding_number;
	if (dpaperJson.collection_num == 'CN311001') {
		newItem.archiveLocation = '中国科学院文献情报中心';
	}
	newItem.callNumber = dpaperJson.cstr_str;
	// missing field: rights
	// missing field: extra
	newItem.tags = dpaperJson.keyword_cn;

	newItem.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://dpaper.las.ac.cn/",
		"detectedItemType": false,
		"items": []
	},
	{
		"type": "web",
		"url": "http://dpaper.las.ac.cn/Dpaper/search/searchResult?highsearch=training_institution_all:%E6%96%87%E7%8C%AE%E6%83%85%E6%8A%A5%E4%B8%AD%E5%BF%83",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://dpaper.las.ac.cn/Dpaper/detail/detailNew?paperID=20201792",
		"items": [
			{
				"itemType": "thesis",
				"title": "科技文献自动标引试验",
				"creators": [
					{
						"lastName": "晁芳",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "1982-01-01",
				"archive": "N80107",
				"archiveLocation": "中国科学院文献情报中心",
				"language": "chi",
				"libraryCatalog": "CAS Dissertation Catalog",
				"place": "中国科学院图书馆",
				"university": "中国科学院研究生院",
				"url": "http://dpaper.las.ac.cn/Dpaper/detail/detailNew?paperID=20201792",
				"attachments": [
					{
						"title": "Snapshot",
						"mimetype": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
