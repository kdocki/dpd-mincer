

## Installation

- Install dpd-mincer with `npm install dpd-mincer`
- Go to your dashboard and create a new asset pipeline resource called /assets.
- Create directories `public/assets/javascripts` and `public/assets/stylesheets`.
- Do your sprockets style requires using mincer in Deployd

## Javascripts

```js
	/**
	 * Inside of public/assets/javascripts/application.js
	 * Be sure to include this file via <script src="/assets/javascripts/application.js"></script>
	 *= require_tree .
	 *= require_self
	 */
```

## Stylesheets

```css
	/**
	 * Inside of public/assets/stylesheets/application.css
	 * Be sure to include this file via <link rel="stylesheet" type="text/css" href="/assets/stylesheets/application.css">
	 *
	 *= require_tree .
	 *= require_self
	 */
```

## Fonts/images whatever else

Your fonts and images can go in public/assets/font and public/assets/img (default for fontawesome and twitter bootstrap). Any assets that aren't .css, .html or .js get ignored really.

## JST (client side javascript templates)

Just include <script src="/assets/javascripts.jst"></script> and then say we had a handlebars template

<!-- /public/assets/javascripts/apps/templates/foobar.hbs.html -->
<ul>
	<li>{{test}}</li>
</ul>

And somewhere in your scripts...

```js
	var template = Handlebars.compile(JST['apps/templates/foobar.hbs']);
	console.log( template({test: 'it works'}) );
```
