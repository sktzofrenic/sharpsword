import requests

def get_chapter(book, chapter):
    url = f'https://www.bible.com/_next/data/EstUqcimnY9UdmTd7umfV/en/bible/1/{book}.{chapter}.KJV.json?versionId=1&usfm={book}.{chapter}.KJV'
    headers = {
        'Cookie': "yv_iid=AHAAgiHyUhk; version=1; cookieConsentBannerConfirmed=true; __yvii=AHCA1iHyUhk; yva=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI5NmFhNDNjODIyMzUwYzc2NWZkMTc3Zjk1ZWJjNTU3NSIsImV4cCI6MTczMDE5NDQ0MSwiaWF0IjoxNzI5MzMwNDQxLCJzdWIiOiIxNzAyMjU0MTcifQ.3JKdsMeup7cCyKt928klozFhWNQ6uR1DfPTBieOFmdA; last_read=EXO.34 "
    }

    response = requests.get(url, headers=headers)
    return response.json()

if __name__ == '__main__':
    book = 'GEN'
    chapter = 1
    print(get_chapter(book, chapter)['pageProps']['chapterInfo']['content'])
