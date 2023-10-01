import express from 'express';
import pkg from 'body-parser';
const { urlencoded, json } = pkg;
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';
import fetch from 'node-fetch';
import memberData from './memberData.json' assert { type: 'json' };
import mockData from './mockData.json' assert { type: 'json' };

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

// Member details and member tätigkeiten from memberData
memberData.forEach((member, memberIndex) => {
  app.get(
    path +
      'mitglied/filtered-for-navigation/gruppierung/gruppierung/*/' +
      (memberIndex + 1),
    (req, res) => {
      res.send({
        success: true,
        data: {
          id: memberIndex + 1,
          mitgliedsNummer: memberIndex + 1,
          ...member.member,

          woelfling: null,
          jungpfadfinder: null,
          pfadfinder: null,
          rover: null,
          ersteUntergliederung: member.taetigkeiten[0].entries_untergliederung,
          mglType:
            member.member.mglTypeId === 'MITGLIED'
              ? 'Mitglied'
              : 'Nicht-Mitglied',
          staatsangehoerigkeit: 'deutsch',
          staatsangehoerigkeitId: 1054,
          staatsangehoerigkeitText: '',
          ersteTaetigkeitId: null,
          ersteTaetigkeit: null,
          nameZusatz: '',
          spitzname: '',
          gruppierungId: mockData.gruppierungIdForMembers,
          gruppierung: mockData.gruppierungNameForMembers,
          beitragsart: 'Voller Beitrag - Stiftungseuro',
          region: 'Hamburg (Deutschland)',
          regionId: 6,
          konfession: null,
          fixBeitrag: null,
          konfessionId: null,
          zeitschriftenversand: true,
          geschlechtId: member.member.geschlecht === 'männlich' ? 19 : 20,
          land: 'Deutschland',
          landId: 1,
          ersteUntergliederungId: null,
          wiederverwendenFlag: false,
          genericField1: '',
          genericField2: '',
          sonst01: false,
          sonst02: false,
          telefax: ''
        },
        responseType: null,
        message: null,
        title: null
      });
    }
  );

  app.get(
    path +
      'zugeordnete-taetigkeiten/filtered-for-navigation/gruppierung-mitglied/mitglied/' +
      (memberIndex + 1) +
      '*',
    (req, res) => {
      res.send({
        success: true,
        data: member.taetigkeiten.map((taetigkeit, taetigkeitIndex) => ({
          entries_aktivBis: taetigkeit.entries_aktivBis,
          entries_beitragsArt: '',
          entries_caeaGroup: taetigkeit.entries_caeaGroup,
          entries_aktivVon: taetigkeit.entries_aktivVon,
          descriptor: 'de.iconcept.nami.entity.zuordnung.TaetigkeitAssignment',
          representedClass:
            'de.iconcept.nami.entity.zuordnung.TaetigkeitAssignment',
          entries_anlagedatum: taetigkeit.entries_anlagedatum,
          entries_caeaGroupForGf: taetigkeit.entries_caeaGroupForGf,
          entries_untergliederung: taetigkeit.entries_untergliederung,
          entries_taetigkeit: taetigkeit.entries_taetigkeit,
          entries_gruppierung: mockData.gruppierungNameForMembers,
          id: (memberIndex + 1) * 10000 + (taetigkeitIndex + 1),
          entries_mitglied:
            member.member.nachname +
            ', ' +
            member.member.vorname.substring(0, 1) +
            ' Mitglied: ' +
            memberIndex +
            1
        })),
        responseType: 'OK',
        totalEntries: member.taetigkeiten.length,
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
});

// All Members from memberData
app.get(
  path + 'mitglied/filtered-for-navigation/gruppierung/gruppierung/*',
  (req, res) => {
    res.send({
      success: true,
      data: memberData.map((member, index) => ({
        descriptor: member.member.nachname + ', ' + member.member.vorname,
        name: '',
        representedClass: 'de.iconcept.nami.entity.mitglied.Mitglied',
        id: index + 1
      })),
      responseType: 'OK',
      totalEntries: memberData.length,
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

// Gruppierungen from mockData
const gruppierungen = Object.entries(mockData.gruppierungen);
gruppierungen.forEach(([gruppierungId, gruppierung]) => {
  app.get(
    path +
      'gruppierungen/filtered-for-navigation/gruppierung/node/' +
      gruppierungId,
    (req, res) => {
      res.send({
        success: true,
        data: gruppierung,
        responseType: 'OK'
      });
    }
  );
});

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
