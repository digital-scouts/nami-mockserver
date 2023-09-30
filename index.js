import express from 'express';
import pkg from 'body-parser';
const { urlencoded, json } = pkg;
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';
import fetch from 'node-fetch';

function extractJSessionID(cookieString) {
  // Definiere den regulären Ausdruck, um den Wert von JSESSIONID zu extrahieren
  const regex = /JSESSIONID=([^;]+)/;

  // Verwende die `match`-Methode, um den Wert zu extrahieren
  const match = cookieString.match(regex);

  // Überprüfe, ob ein Übereinstimmung gefunden wurde
  if (match && match[1]) {
    return match[1];
  } else {
    return null; // Wenn keine Übereinstimmung gefunden wurde
  }
}

const path = '/ica/rest/api/1/1/service/nami/';
const app = express();
const port = 3000;

app.use(morgan('combined'));

// Middleware zum Parsen von x-www-form-urlencoded Daten
app.use(urlencoded({ extended: false }));

// Middleware, um den Request-Body zu verarbeiten
app.use(json());

const proxy = createProxyMiddleware({
  target: 'https://nami.dpsg.de',
  changeOrigin: true,
  logger: console,
  followRedirects: false,
  onError: (err, req, res, target) => {
    console.log('Proxy error:', err);
    res.writeHead(500, {
      'Content-Type': 'application/json'
    });
    res.end({
      message: 'Something went wrong on proxy request. Please retry.'
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    // Passe den Header an, bevor die Anfrage an die Ziel-URL gesendet wird
    proxyReq.setHeader('Host', 'nami.dpsg.de');
    proxyReq.setHeader('Origin', 'https://nami.dpsg.de');
    proxyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
  }
});

function isUserTestRequest(req) {
  // Auth request always goes through
  if (req.url.includes('auth/manual/sessionStartup')) {
    return true;
  } else if (req.headers.cookie?.toString().includes('testApiSessionToken')) {
    console.log('Test user detected');
    return true;
  }
  console.log('No test user detected');
  return false;
}

app.use((req, res, next) => {
  console.log('Request:', req.url);
  if (!isUserTestRequest(req)) {
    return proxy(req, res, next).catch((err) => {
      console.error('Fehler bei der Weiterleitung:', err);
      res.status(500).send('Interner Serverfehler');
    });
  } else {
    next();
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

//Mitglied 1
app.get(
  path + 'mitglied/filtered-for-navigation/gruppierung/gruppierung/*/1',
  (req, res) => {
    res.send({
      success: true,
      data: {
        geschlecht: 'männlich',
        emailVertretungsberechtigter: 'liam.papa@smith.de',
        lastUpdated: '2022-11-14 10:02:39',
        id: 1,
        version: 34,
        landId: 1,
        mglTypeId: 'MITGLIED',
        nachname: 'Smith',
        eintrittsdatum: '2016-11-18 00:00:00',
        status: 'Aktiv',
        telefon3: '',
        email: 'liam@smith.de',
        telefon1: '040 123 456',
        telefon2: 'Papa: 0171 321 321 / Mama: 01578 123 123',
        strasse: 'Musterweg 1',
        vorname: 'Liam',
        mitgliedsNummer: 1,
        austrittsDatum: '',
        ort: 'Hamburg',
        geburtsDatum: '2009-02-16 00:00:00',
        stufe: 'Pfadfinder',
        beitragsartId: 4,
        plz: '22523'
      },
      responseType: null,
      message: null,
      title: null
    });
  }
);

//Mitglied 2
app.get(
  path + 'mitglied/filtered-for-navigation/gruppierung/gruppierung/*/2',
  (req, res) => {
    res.send({
      success: true,
      data: {
        geschlecht: 'weiblich',
        emailVertretungsberechtigter: 'emma.mama@johnson.de',
        lastUpdated: '2022-10-25 09:45:21',
        id: 2,
        version: 29,
        landId: 1,
        mglTypeId: 'MITGLIED',
        nachname: 'Johnson',
        eintrittsdatum: '2018-07-22 00:00:00',
        status: 'Aktiv',
        telefon3: '',
        email: 'emma@johnson.de',
        telefon1: '030 987 654',
        telefon2: 'Mama: 0162 987 987 / Papa: 0176 543 543',
        strasse: 'Musterstraße 2',
        vorname: 'Emma',
        mitgliedsNummer: 2,
        austrittsDatum: '',
        ort: 'Berlin',
        geburtsDatum: '2010-05-03 00:00:00',
        stufe: 'Pfadfinder',
        beitragsartId: 4,
        plz: '10115'
      },
      responseType: null,
      message: null,
      title: null
    });
  }
);

//Mitglied 3
app.get(
  path + 'mitglied/filtered-for-navigation/gruppierung/gruppierung/*/3',
  (req, res) => {
    res.send({
      success: true,
      data: {
        geschlecht: 'männlich',
        emailVertretungsberechtigter: 'noah.papa@davis.de',
        lastUpdated: '2022-09-30 14:20:17',
        id: 3,
        version: 31,
        landId: 1,
        mglTypeId: 'MITGLIED',
        nachname: 'Davis',
        eintrittsdatum: '2017-03-10 00:00:00',
        status: 'Aktiv',
        telefon3: '',
        email: 'noah@davis.de',
        telefon1: '0170 789 123',
        telefon2: '0159 987 789',
        strasse: 'Musterweg 3',
        vorname: 'Noah',
        mitgliedsNummer: 3,
        austrittsDatum: '',
        ort: 'München',
        geburtsDatum: '2011-08-27 00:00:00',
        stufe: 'Pfadfinder',
        beitragsartId: 4,
        plz: '80331'
      },
      responseType: null,
      message: null,
      title: null
    });
  }
);

// All Members
app.get(
  path + 'mitglied/filtered-for-navigation/gruppierung/gruppierung/*',
  (req, res) => {
    res.send({
      success: true,
      data: [
        {
          descriptor: 'Smith, Liam',
          name: '',
          representedClass: 'de.iconcept.nami.entity.mitglied.Mitglied',
          id: 1
        },
        {
          descriptor: 'Johnson, Emma',
          name: '',
          representedClass: 'de.iconcept.nami.entity.mitglied.Mitglied',
          id: 2
        },
        {
          descriptor: 'Davis, Noah',
          name: '',
          representedClass: 'de.iconcept.nami.entity.mitglied.Mitglied',
          id: 3
        }
      ],
      responseType: 'OK',
      totalEntries: 3,
      metaData: {
        totalProperty: 'totalEntries',
        root: 'data',
        id: 'id',
        fields: [
          {
            name: 'id',
            header: null,
            hidden: false,
            width: 80
          },
          {
            name: 'descriptor',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'name',
            header: null,
            hidden: false,
            flex: 3
          }
        ]
      }
    });
  }
);

// Tätigkeiten Mitglied 1
app.get(
  path +
    'zugeordnete-taetigkeiten/filtered-for-navigation/gruppierung-mitglied/mitglied/1*',
  (req, res) => {
    res.send({
      success: true,
      data: [
        {
          entries_aktivBis: '',
          entries_beitragsArt: '',
          entries_caeaGroup: '',
          entries_aktivVon: '2022-10-07 00:00:00',
          descriptor: 'de.iconcept.nami.entity.zuordnung.TaetigkeitAssignment',
          representedClass:
            'de.iconcept.nami.entity.zuordnung.TaetigkeitAssignment',
          entries_anlagedatum: '2022-11-14 10:02:39',
          entries_caeaGroupForGf: '',
          entries_untergliederung: 'Pfadfinder',
          entries_taetigkeit: '€ Mitglied (1)',
          entries_gruppierung: 'Hamburg-Eidelstedt, Stamm Mock 333',
          id: 11,
          entries_mitglied: 'Smith, L. Mitglied: 1'
        },
        {
          entries_aktivBis: '2022-10-06 00:00:00',
          entries_beitragsArt: '',
          entries_caeaGroup: '',
          entries_aktivVon: '2020-10-02 00:00:00',
          descriptor: 'de.iconcept.nami.entity.zuordnung.TaetigkeitAssignment',
          representedClass:
            'de.iconcept.nami.entity.zuordnung.TaetigkeitAssignment',
          entries_anlagedatum: '2020-10-30 10:39:46',
          entries_caeaGroupForGf: '',
          entries_untergliederung: 'Jungpfadfinder',
          entries_taetigkeit: '€ Mitglied (1)',
          entries_gruppierung: 'Hamburg-Eidelstedt, Stamm Mock 333',
          id: 12,
          entries_mitglied: 'Smith, L. Mitglied: 1'
        },
        {
          entries_aktivBis: '2020-10-01 00:00:00',
          entries_beitragsArt: '',
          entries_caeaGroup: '',
          entries_aktivVon: '2016-11-18 00:00:00',
          descriptor: 'de.iconcept.nami.entity.zuordnung.TaetigkeitAssignment',
          representedClass:
            'de.iconcept.nami.entity.zuordnung.TaetigkeitAssignment',
          entries_anlagedatum: '2016-12-04 16:42:58',
          entries_caeaGroupForGf: '',
          entries_untergliederung: 'Wölfling',
          entries_taetigkeit: '€ Mitglied (1)',
          entries_gruppierung: 'Hamburg-Eidelstedt, Stamm Mock 333',
          id: 13,
          entries_mitglied: 'Smith, L. Mitglied: 1'
        }
      ],
      responseType: 'OK',
      totalEntries: 3,
      metaData: {
        totalProperty: 'totalEntries',
        root: 'data',
        id: 'id',
        fields: [
          {
            name: 'id',
            header: null,
            hidden: false,
            width: 80
          },
          {
            name: 'descriptor',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_untergliederung',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_taetigkeit',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_beitragsArt',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_aktivVon',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_caeaGroup',
            header: null,
            hidden: true,
            flex: 3
          },
          {
            name: 'entries_aktivBis',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_caeaGroupForGf',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_gruppierung',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_mitglied',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_anlagedatum',
            header: null,
            hidden: false,
            flex: 3
          }
        ]
      }
    });
  }
);

// Tätigkeiten Mitglied 2
app.get(
  path +
    'zugeordnete-taetigkeiten/filtered-for-navigation/gruppierung-mitglied/mitglied/2*',
  (req, res) => {
    res.send({
      success: true,
      data: [
        {
          entries_aktivBis: '',
          entries_beitragsArt: '',
          entries_caeaGroup: '',
          entries_aktivVon: '2022-10-07 00:00:00',
          descriptor: 'de.iconcept.nami.entity.zuordnung.TaetigkeitAssignment',
          representedClass:
            'de.iconcept.nami.entity.zuordnung.TaetigkeitAssignment',
          entries_anlagedatum: '2022-11-14 10:02:39',
          entries_caeaGroupForGf: '',
          entries_untergliederung: 'Jungpfadfinder',
          entries_taetigkeit: '€ Mitglied (1)',
          entries_gruppierung: 'Hamburg-Eidelstedt, Stamm Mock 333',
          id: 11,
          entries_mitglied: 'Johnson, E. Mitglied: 2'
        },
        {
          entries_aktivBis: '2022-10-06 00:00:00',
          entries_beitragsArt: '',
          entries_caeaGroup: '',
          entries_aktivVon: '2020-10-02 00:00:00',
          descriptor: 'de.iconcept.nami.entity.zuordnung.TaetigkeitAssignment',
          representedClass:
            'de.iconcept.nami.entity.zuordnung.TaetigkeitAssignment',
          entries_anlagedatum: '2020-10-30 10:39:46',
          entries_caeaGroupForGf: '',
          entries_untergliederung: 'Wölfling',
          entries_taetigkeit: '€ Mitglied (1)',
          entries_gruppierung: 'Hamburg-Eidelstedt, Stamm Mock 333',
          id: 12,
          entries_mitglied: 'Johnson, E. Mitglied: 2'
        }
      ],
      responseType: 'OK',
      totalEntries: 2,
      metaData: {
        totalProperty: 'totalEntries',
        root: 'data',
        id: 'id',
        fields: [
          {
            name: 'id',
            header: null,
            hidden: false,
            width: 80
          },
          {
            name: 'descriptor',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_untergliederung',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_taetigkeit',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_beitragsArt',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_aktivVon',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_caeaGroup',
            header: null,
            hidden: true,
            flex: 3
          },
          {
            name: 'entries_aktivBis',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_caeaGroupForGf',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_gruppierung',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_mitglied',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_anlagedatum',
            header: null,
            hidden: false,
            flex: 3
          }
        ]
      }
    });
  }
);

// Tätigkeiten Mitglied 3
app.get(
  path +
    'zugeordnete-taetigkeiten/filtered-for-navigation/gruppierung-mitglied/mitglied/3*',
  (req, res) => {
    res.send({
      success: true,
      data: [
        {
          entries_aktivBis: '2022-10-06 00:00:00',
          entries_beitragsArt: '',
          entries_caeaGroup: '',
          entries_aktivVon: '2020-10-02 00:00:00',
          descriptor: 'de.iconcept.nami.entity.zuordnung.TaetigkeitAssignment',
          representedClass:
            'de.iconcept.nami.entity.zuordnung.TaetigkeitAssignment',
          entries_anlagedatum: '2020-10-30 10:39:46',
          entries_caeaGroupForGf: '',
          entries_untergliederung: 'Wölfling',
          entries_taetigkeit: '€ Mitglied (1)',
          entries_gruppierung: 'Hamburg-Eidelstedt, Stamm Mock 333',
          id: 12,
          entries_mitglied: 'Davis, N. Mitglied: 3'
        }
      ],
      responseType: 'OK',
      totalEntries: 1,
      metaData: {
        totalProperty: 'totalEntries',
        root: 'data',
        id: 'id',
        fields: [
          {
            name: 'id',
            header: null,
            hidden: false,
            width: 80
          },
          {
            name: 'descriptor',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_untergliederung',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_taetigkeit',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_beitragsArt',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_aktivVon',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_caeaGroup',
            header: null,
            hidden: true,
            flex: 3
          },
          {
            name: 'entries_aktivBis',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_caeaGroupForGf',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_gruppierung',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_mitglied',
            header: null,
            hidden: false,
            flex: 3
          },
          {
            name: 'entries_anlagedatum',
            header: null,
            hidden: false,
            flex: 3
          }
        ]
      }
    });
  }
);

// Stats
app.get('/ica/rest/dashboard/stats/stats', (req, res) => {
  res.send({
    success: true,
    data: {
      nrMitglieder: 10,
      statsCategories: [
        {
          name: 'Wölfling',
          count: 2
        },
        {
          name: 'Jungpfadfinder',
          count: 2
        },
        {
          name: 'Pfadfinder',
          count: 2
        },
        {
          name: 'Rover',
          count: 2
        },
        {
          name: 'Vorstand',
          count: 2
        }
      ]
    },
    responseType: 'OK',
    message: null,
    title: null
  });
});

// Gruppierung 1
app.get(
  path + 'gruppierungen/filtered-for-navigation/gruppierung/node/1',
  (req, res) => {
    res.send({
      success: true,
      data: [
        {
          descriptor: 'Diözesanverband Mock 22',
          name: '',
          representedClass: 'de.iconcept.nami.entity.org.Gruppierung',
          id: 22
        }
      ],
      responseType: 'OK'
    });
  }
);

// Gruppierung 2
app.get(
  path + 'gruppierungen/filtered-for-navigation/gruppierung/node/22',
  (req, res) => {
    res.send({
      success: true,
      data: [
        {
          descriptor: 'Hamburg-Eidelstedt, Stamm Mock 333',
          name: '',
          representedClass: 'de.iconcept.nami.entity.org.Gruppierung',
          id: 333
        }
      ],
      responseType: 'OK'
    });
  }
);

// Gruppierung 3
app.get(
  path + 'gruppierungen/filtered-for-navigation/gruppierung/node/333',
  (req, res) => {
    res.send({
      success: true,
      data: [],
      responseType: 'OK'
    });
  }
);

// sessionStartup
app.post(path + 'auth/manual/sessionStartup', async (req, res) => {
  if (req.body.username === '1234' && req.body.password === 'test') {
    console.log('Test user logged in');
    res.cookie('JSESSIONID', 'testApiSessionToken.srv-nami06', {
      maxAge: 9000,
      httpOnly: true
    });
    res.send({
      servicePrefix: null,
      methodCall: null,
      response: null,
      statusCode: 0,
      statusMessage: '',
      apiSessionName: 'JSESSIONID',
      apiSessionToken: 'testApiSessionToken',
      minorNumber: 2,
      majorNumber: 1
    });
    console.log('Test user logged in - end');
  } else {
    console.log('Real user logged in');
    // Define the URL and other data
    const url = `https://nami.dpsg.de/ica/rest/api/1/1/service/nami/auth/manual/sessionStartup`;
    const params = new URLSearchParams();
    params.append('username', req.body.username);
    params.append('password', req.body.password);
    params.append('Login', 'API');
    const headers = {
      Host: 'nami.dpsg.de',
      Origin: 'https://nami.dpsg.de',
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const response = await fetch(url, {
      method: 'POST',
      body: params,
      headers: headers
    });
    const cookie = response.headers.raw()['set-cookie'][0];
    console.log('Cookie:', cookie);
    res.cookie('JSESSIONID', extractJSessionID(cookie) + '.srv-nami06', {
      maxAge: 9000,
      httpOnly: true
    });
    res.send(await response.text());
    console.log('Real user logged in - end');
  }
});

// Starte den Server
app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
