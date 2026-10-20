# Attio homepage mirror

A local snapshot of the public Attio homepage, including its captured HTML, original first-party CSS, JavaScript, fonts, media assets, and REA comparison screenshots. The mirror keeps Attio's page scripts active so the responsive layout, menus, and product preview animations run locally.

## Run locally

Requires Node.js 18 or newer.

```powershell
npm run start:attio
```

Open <http://127.0.0.1:4174>.

To refresh the snapshot from the live homepage:

```powershell
npm run mirror:attio
```

Other Attio routes are not included; links to those pages lead to the live site. See [the fidelity ledger](attio/reference/fidelity-ledger.md) for the REA comparison notes and captures.