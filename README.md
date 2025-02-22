# Steps to Run
```
cd eventopia
npm install
npm run dev
```

# Links
Figma: https://www.figma.com/design/G6tce7lOO85AtAWaGxJaSd/Eventopia?node-id=0-1&t=ZoQzRhDi63pl8rHm-1

# Dev Notes
```ts
    // Souce has to use together with Layer (the documentation eliminates the Layer which is wrong)

    // Example 1: self-defined geojson data
    import Map, { Source, Layer } from 'react-map-gl';

    // define data to be plotted
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-122.4, 37.8] },
          properties: { name: 'San Francisco' },
        },
      ],
    };

    // how the data is styled
    const circleLayer = {
      id: 'my-circle-layer',
      type: 'circle',
      source: 'my-data',
      paint: {
        'circle-radius': 10,
        'circle-color': 'red',
      },
    };

    <Map
          initialViewState={{
            longitude: -122.4,
            latitude: 37.8,
            zoom: 10,
          }}
          style={{ width: '100%', height: '400px' }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={mapboxAccessToken}
        >
          <Source id="my-data" type="geojson" data={geojson}>
            <Layer {...circleLayer} />
          </Source>
    </Map>

```

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
