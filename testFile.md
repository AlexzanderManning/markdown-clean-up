# Common fixes and hacks for minor setup issues. 

## Update WSG prices on window load
This will update prices to wholesale when the window load event fires.  If wsgRunProduct = true product update will be updated, wsgRunCOllection = true collection update will run.
1. Only use when necessary (wrap in liquid to only run on product templates for example)
2. In wsg-header.liquid add this hidden span: <br>
`<span id="wsgReloadPrices_Window" style="display: none"></span>`
  
## Theme Specific   
#### Kingdom   
Issues with scrollbar on proxy pages and weird select elements.  If this needs to be added again let's make it part of the model.  Put this at the bottom of the DOM content loaded event in wsg-header so it runs for all customers:   
```   
  //fix issue of proxy pages not resizing properly
  jQuery(window).on("load", function(){
    if(jQuery(".wsg-proxy-container").length > 0){
      jQuery(window).trigger('resize');
      //fix weird selects
      jQuery(".regular-select-cover").attr("style", "");
      jQuery(".regular-select-inner").css("display", "none");
      jQuery(".wsg-proxy-container span").removeClass("regular-select-cover regular-select-inner");
      jQuery(".wsg-input-small .arrow").hide();
    }
  })   
```      
    
Then in wsgCustomJs:   
```   
  //fix scroll issue on proxy pages
    jQuery("#wsg-checkout-one").on("click", function(){
       setTimeout(function(){
         jQuery("#content").css("top", "0");
       }, 800)
   	})
    jQuery(".wsg-return-to-summary").on("click", function(){
      setTimeout(function(){
      	jQuery(window).trigger("resize");
      }, 800)
    })
```   
#### Broadcast
**Collection prices won't change**

Some new versions of this theme use an animation library to handle the infinite scroll effect. This library enables MutationObservers that look for any changes in the DOM and then runs a function to set the DOM back to it's original state. In most cases, you can disable infinite scroll on the theme and you should be fine. 

If that doesn't work, you'll have to open `snippets/product-grid-item.liquid` and add a new custom `<span>` for the price: 
```
<span class="price{% if product.compare_at_price > product.price %} sale{% endif %}">
          {% if product.object_type == 'product' %}
            {% if product.available %}
              {% if product.compare_at_price > product.price %}
                <span class="old-price">{{ product.compare_at_price | money }}</span>
              {% endif %}
              {% if product.price_varies %}
                <small>{{ 'products.general.from' | t }}</small> <span class="money" data-product-id="{{ product.id }}">{{ product.price_min | money }}</span>
              {% else %}
                <span class="money" data-product-id="{{ product.id }}">{{ product.price_min | money }}</span>
              {% endif %}
            {% else %}
              <span class="sold-out">{{ 'products.product.sold_out' | t }}</span>
            {% endif %}
          {% else %}
            <span class="item-type">{{ item_type }}</span>
          {% endif %}
        </span>
```
At the end of this section add the following Liquid and HTML:
```
        <!-- check for active ws customer -->
        {%- assign isWsgCustomer = false -%}
        {%- if customer.tags != blank -%}
              {%- for tag in customer.tags -%}
                  {%- if shop.metafields.wsg_data.excludeCollections contains tag -%}
                      {%- assign isWsgCustomer = true -%}
                      {%- continue -%}
              {%- endif -%}
            {%- endfor -%}
        {%- endif -%}
        {%- if isWsgCustomer == true -%}        
       	 <span class='wsgPrice'>{{ product.price_min | money }}</span>
        {%- endif -%}
```
From there you can add that span `.wsgPrice` to the priceSelectors in `wsg-header.liquid` and then create a wholesale-only css rule for the original price selector

`.price {
    display: none !important;
  }`  
      
#### Product Page - Price doesn't change on variant selection
**product swatch double click price change**   
Set in wsg-header.liquid (automated as of 09/20/19):      
`var wsgSwatch = ".swatch_options .swatch-element";`   
   
## Symmetry Product Quick View
Hide product quick view and add to cart form on collection pages with this custom CSS in the header:

`.collection-listing .product-detail .product-form, .collection-listing .product-detail .price-area  {`
     `display: none !important; `
  `}`

## 404 Error
Everything is installed correctly but one or more of our scripts is getting a 404 error in the console and no wsg functions run.  This is likely because the user changed our proxy URL.  If you go to the apps page in their store and click "View Details" next to the WSG app make sure the select element ends with **/a** and the text field says **wsg**  
Example Error:
![example error](https://user-images.githubusercontent.com/49496945/61962875-8a330500-af98-11e9-9326-dbf616170c5b.png)
Correct Proxy Url:
![Correct proxy](https://user-images.githubusercontent.com/49496945/61962896-9ae37b00-af98-11e9-845a-658b9f4b123a.png)

## Checkout Buttons Don't Appear/Console Error
Check for the following error in the console: 

```
Uncaught TypeError: Cannot read property 'getAttribute' of undefined
    at wsgShopify.CountryProvinceSelector.countryHandler (ws-cart?wsgTestMode:265)
    at wsgShopify.CountryProvinceSelector.initCountry (ws-cart?wsgTestMode:265)
    at new wsgShopify.CountryProvinceSelector (ws-cart?wsgTestMode:265)
    at Object.exports.run (wsg-index.js:2934)
    at HTMLDocument.<anonymous> (wsg-index.js:4384)
    at e (wsg-jquery:2)
    at t (wsg-jquery:2)
```

This means the shop has not set up their shipping zone. We will need to use the inspector/DOM to force the buttons to be visible in order to verify the styles on both the buttons and the shipping form, then add the NO SHIPPING welcome email macro.

To see the buttons, inspect where they *should* be in the DOM, and uncheck the element style `display: none;`. 

To see the shipping form, you will have to find `<div id="wsg-cart-shipping">` in the inspector and uncheck the `display:none;`, as clicking the button in this state will trigger the session expired page. 

## Disable Recharge  
Add to WS only CSS area in wsg-header   
  `#rc_container {
    display: none !important;
  }`   

If a shop has recharge and the price is changing on the product after add to cart - wrap the following in a check so it only runs where needed inside our custom JS in wsgHeader: 
`window.rcWidget._updateProductPrice = ''`. 
This redefines their price override function to a string, which means it won't work so it doesn't overwrite our prices. 

Sample (not pretty but it works): 
```
if(isWsgCustomer){
    {% if template contains "product" %}
      window.rcWidget._updateProductPrice = ''
    {% endif%}
  }
```
   
## Disable Bold RO - Recurring Orders   
Add to wholesale-only css in wsg-header.liquid:  
```  
.ro_widget {  
   display: none !important;  
}  
```
   
## wsgPrice is undefined error (usually on product page)   
`wsg-index.js:2426 Uncaught TypeError: Cannot read property 'wsgPrice' of undefined   `   

This is likely related to legacy WSG code still being on the shop. It is usually associated with trying to find a variant. On the home page, featured product is a likely culprit. Look for old code (wsg-price-itemID in classes is a good clue) and remove.   
Sample found in legacy store featured-product: 
```
<script> 
  wsgRunProduct = true; 
      var wsgProdData = {{product | json}}    
    //product variables
    var wsgCollectionsList = {{product.collections | json}} 
    
      {% if bold_selected_or_first_available_variant.id %}
        var wsgCurrentVariant = {{ bold_selected_or_first_available_variant.id }};
    {% else %}
        var wsgCurrentVariant = null;
    {% endif %}
</script>
```
   
## Variant undefined error on product page or Product Page Prices don't update on Variant Change   
`TypeError: calculatedPrices[variantId] is undefined`   

This can most likely be fixed by forcing the select listener to use the querystring to get the variant id.  In wsg-header.liquid add this in :

```
{% if template == "product" %} 
<span id="wsgForceQuerystring" style="display: none"></span>
{% endif %}
```
    
## Currency Format Issues
#### Currency symbols not rendering.  
If you are getting '&EURO' or '&pound' instead of '€' or '£' in front of prices, find    
  ```
//money formatting  
  var wsgMoneyFormat = "{{ shop.money_format | strip_html }}"
``` 
in `wsg-header` and add this line below it, replacing the &pound/£ as necessary  
```
wsgMoneyFormat = wsgMoneyFormat.replace('&pound;', '£');
```   
Sometimes this still doesn't work, so head to theme.liquid and right before the closing body tag add:   
```   
{% if isWsgCustomer == true %}
  <script>
  //currency fix for wholesale customers
    wsgMoneyFormat = wsgMoneyFormat.replace('&pound;', '£')
    Shopify.money_format = wsgMoneyFormat;
  </script>
{% endif %}   
```
and right before `{% include wsg-header %}` add:   
```   
{% assign isWsgCustomer = false %}
```
## Formatting a store's prices without decimals 
If a store asks for product prices that are rounded to the nearest dollar, you can use the following
replace the ```wsgMoneyFormat``` with the following. Just replace the USD with whichever currency symbol the store is using.

```
var wsgMoneyFormat = {% raw %}"${{ amount_no_decimals }}"{% endraw %};
```

## Shopify is not defined   
Shopify is not defined show in console almost immediately, but typing wsgShopify into console returns an object.  This likely means our script is loading too early for some reason.  Try moving `{% include 'wsg-header' %}` farther down the page - possibly right before closing body tag or after `{{ content for header }}`


## Collections
#### Owl Collection issues - usually featured products.  
The issue with this is usually that there is some sort of css clear rule that moves our comment node of all the data to a strange place.  If you can find the commented nodes in the inspector all in one place (instead of above each item) this is likely the fix:   
1. Where our for loop for exclusions are change the **wsgStatusAction** in the second include of 'wsg-status' from _'col-item' to 'ajax-search'_.  
`{%- if wsgActive -%}{%- include 'wsg-status' wsgStatusAction: 'ajax-search' | strip -%}{%- endif -%}`
2. Somewhere a node or two down from our main exclusions loop add the following.  Keep in mind that the **next sibling of this code must include the price selector** somewhere within it.  Also this line of code should only be added once.      
`{%- if wsgActive -%}{%- include 'wsg-status' wsgStatusAction: 'col-item' | strip -%}{%- endif -%}`
3.  This will run the exclusion in the main loop and set our liquid variables, but 'ajax-search' as an action won't output our comment node.  Then the second line will drop in our data node.


## Ajax Cart  
#### On adding product to cart **from product page**, error "Unexpected end of JSON input" and no prices update:  
<img width="448" alt="Screen Shot 2019-07-30 at 4 55 30 PM" src="https://user-images.githubusercontent.com/49496945/62171113-220f5680-b2eb-11e9-86de-d5250956ad19.png">   

This is likely due to no collection data being visible for the product.  In wsg-header.liquid try changing the conditional to show the product data on the product pages from template == 'product' to template contains 'product'. 
`<!-- product data -->
{% if template contains "product" %}` 
   

## Checkout link issues
#### Add to cart click reveals checkout link   
Add a listener that fires on click of the ATC button to change the href of the link (or you can user javascript if it's not a link but is a script based checkout).  Something like:   

`jQuery(".add-to-cart input").on("click", function(){
  setTimeout(function(){
    jQuery(".product-message a[href$='/checkout']").prop("href", "/cart")
  }, 1000)
})`   

#### T&C listener - terms and conditions   
In wsgCustomJs:   
```   
    wsgCheckTC();   
    jQuery("#CartAgree").on("click", function(){   
      setTimeout(function(){   
        wsgCheckTC();   
      }, 250)   
   }) 
```

#### Brooklyn
For **Brooklyn** themes you may have to add this code inside of a click event attached to all cart buttons on the store, as the ajax cart elements don't exist on this theme until you click the cart button the first time.
  
```
jQuery(".cart-link").on("click", function(){ 
      setTimeout(function(){
        wsgCheckTC();
        jQuery("#agree").on("click", function(){ 
          setTimeout(function(){
            wsgCheckTC(); 
          }, 500) 
        })    
      }, 500) 
    })  
```
     
Near checkAjaxChange:   
```    
   function wsgCheckTC(){   
      if(jQuery("#CartAgree").prop("checked")){   
        jQuery(".cart__checkout--ajax").prop("disabled", false)   
      } else {   
        jQuery(".cart__checkout--ajax").prop("disabled", true)   
      }   
    }   
```

  
## First checkout button on ws-cart proxy goes to checkout before shipping can be entered.  
Check for an upsell app (I think it's called zipify upsell), but towards the bottom of theme.liquid will be the code: `{% include 'upsellapp-theme' %}`.  Right above wsg-header add the liquid:   
`{%- assign isWsgCustomer = false -%}`    
`{% include "wsg-header" %}`  
Then around upsell app:   
`{% unless isWsgCustomer == true %}   `   
`<!--     disable upsell app for wholesale customers to prevent improper checkouts -->   `   
`{% include 'upsellapp-theme' %}   `   
`{% endunless %}`   
   
## Quantity inputs are changed by javascript   
#### Cart page not reloading on quantity change.  
Not pretty but it works:      
```   
    jQuery("#WSGCartSection .js-qty__adjust").hide();
    jQuery(".wsg-cart__qty-container input").prop("type", "number");   
```   
You can also try these styles if it looks weird:   
```   
  .gridlock .row .wsg-proxy-container [class*="all-"],
  .gridlock .row .wsg-proxy-container [class*="mobile-"] {
    float: none !important;
  }  
  .wsg-proxy-container button {
    min-width: 10px !important;
    line-height: 32px !important;
    margin-bottom: 0 !important;
  }
  .wsg-proxy-container input.js-qty__num {
    float: none !important;
  }
  .wsg-proxy-container .js-qty__adjust {
    background: inherit !important;
    color: inherit !important;
    border: thin solid #d1d1d1 !important;
    max-width: 35px !important;
    max-height: 32px !important; 
  }   
```
   
   
## Styles   

#### Select and inputs at checkout strange sizes.   
`   .wsg-login-container input, #wsg-ship-modal input, .wsg-table input[type='number'], #wsg-signup input, #wsg-signup textarea, #wsg-signup select {   `
    `box-sizing: border-box;   `
  `}    `
  `.wsg-proxy-container input[type='number']{   `
    `max-height: 18px !important;   `
  `}`
   
  
## SPOF  

#### SPOF table area is too big.  
Add css to header:  
`.wsg-table td {   
  min-width: 65px !important;  
}`

#### Single Page Order Form (SPOF) Affects Footer Styling
On some custom themes built from old Shopify theme scaffolds, the Single page order form embed breaks the styling of the Footer. This often because the Footer is outside of the `<main> `tag in the document, so it's not inheriting the styles it needs to. You might be able to quickly fix this by taking the `<footer>` tag and appending it to the main via the appendChild method:

```
window.addEventListener('load', event => {
  if (window.location.href.includes('/a/wsg/proxy/single-page-order')) {
    let footer  = document.querySelector('footer');
    document.querySelector('.main-content').appendChild(footer);
  }  
})
```

## Accounts   
  
#### Site redirect issues.   
If we have an account but can't log in check to see if we are getting automatically redirected based on Geo location.   
App: **GeoIP Country Redirect**: add `?no_rule=true` to initial url to set cookie that won't redirect you.



