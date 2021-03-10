$(function() {

  var pageType
  var website
  if ($('.pageType-ProductPage').length) {
    pageType = 'PDP';
  } else if ($('.page-search').length || $('.pageType-CategoryPage').length) {
    pageType = 'PLP';
  } else if ($('.page-account-wishlist').length) {
    pageType = 'Wishlist';
  } else if (location.pathname == '/') {
    pageType = 'Homepage'
  } else if ($('.page-cartPage').length) {
    pageType = 'Cart'
  } else if (location.pathname.indexOf('payment-method') > -1) {
    pageType = 'Payment'
  }

  if (location.hostname == 'www.thetoyshop.com') {
    website = 'ToyShop'
  } else {
    website = 'ELC'
  }

  function refreshWishlist() {
    var wishlist = []
    $('.prod_wishlist_datalayer').each(function() {
      var SKU = $(this).data('productcode').toString();
      wishlist.push(SKU)
    })
    localStorage.setItem('Wishlist', JSON.stringify(wishlist));
  }


  function listPageWishlist() {
    $('.btn-wishlist').on('click', function() {
      var SKU = $(this).prev().data('productcode').toString();
      if ($(this).children('.inWishlist').css('display') == 'none') {
        if (localStorage.getItem('Wishlist') === null) {
          var wishlist = [];
          wishlist.push(SKU);
          localStorage.setItem('Wishlist', JSON.stringify(wishlist));
        } else {
          var wishlist = JSON.parse(localStorage.getItem('Wishlist'));
          wishlist.push(SKU);
          localStorage.setItem('Wishlist', JSON.stringify(wishlist));
        }
      } else {
        if (localStorage.getItem('Wishlist') != null) {
          var wishlist = JSON.parse(localStorage.getItem('Wishlist'));
          var index = wishlist.indexOf(SKU);
          if (index > -1) {
            wishlist.splice(index, 1);
            localStorage.setItem('Wishlist', JSON.stringify(wishlist));
          }
        }
      }
    })
  }

  //Toy Appeal Functions
  function toyAppealPDP() {
    $('.taSteps').appendTo('.col-sm-12.col-md-7.col-lg-6');
    $('.taSteps').css('display', 'block');
    $('.taDesc').appendTo('.col-md-6.col-md-offset-3.col-lg-6.col-lg-offset-3:eq(0) .tabbody');
    $('.taDesc').css('display', 'block');
    $('.col-md-6.col-md-offset-3.col-lg-6.col-lg-offset-3:eq(0) .tabbody').css('padding', '0');
  }

  function toyAppealCart() {
    var target = document.getElementById('colorbox');
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'style') {
          $('#colorbox, #cboxOverlay').remove();
          setTimeout(function() {
            location.replace('/cart');
          }, 1000);
        }
      });
    });
    var config = {
      attributes: true,
      attributeFilter: ['style'],
    };
    var collect = $('.cart__delivery--store').length;
    var arr = basketSKUs;
    var bought = arr.indexOf('537996');
    var exist = arr.length;

    if ((collect == 0 && bought == -1) != (exist == 0)) {
      $('.taadd').prependTo('.cart-totals');
      $('.taadd').css('display', 'inline-block');
      $('#colorbox, #cboxOverlay').css('display', 'none!important');
      $('.taadd #addToCartForm').click(function(e) {
        observer.observe(target, config);
        var trackers = ga.getAll();
        var t = trackers[0].get('name');
        ga(t + '.send', 'event', 'Toy Appeal Donate', 'Basket Page CTA', 'Donate', {
          nonInteraction: false
        })
      });
    }
    ACC["product"]["bindToAddToCartForm"]();
  }

  //Strapline animation
  function straplineAnimation() {
    $('.owl-carousel.etCustServeMsgCarousel').owlCarousel({
      loop: true,
      margin: 0,
      autoPlay: true,
      autoPlayTimeout: 1000,
      navigation: true,
      itemsDesktop: [5000, 2],
      itemsDesktopSmall: [1024, 2],
      itemsTablet: [768, 1],
      itemsMobile: [480, 1]
    });
    $('.owl-carousel.etCustServeMsgCarousel .item:gt(0)').css('display','block')
  }

  //Klarna Functions
  var klarnaFooter = dataLayer.find(x => x.event === 'klarnaVariables').klarnaFooter;
  var klarnaPDP = dataLayer.find(x => x.event === 'klarnaVariables').klarnaPDP;
  var klarnaCart = dataLayer.find(x => x.event === 'klarnaVariables').klarnaCart;

  function refreshKlarna() {
    window.KlarnaOnsiteService = window.KlarnaOnsiteService || [];
    window.KlarnaOnsiteService.push({
      eventName: 'refresh-placements'
    });
  }

  if (location.pathname == '/klarna') {
    refreshKlarna();
  }
  if (klarnaFooter === true) {
    $('.footer__payments').prepend('<span><img src="/medias/Klarna-PaymentBadge-OutsideCheckout-Pink-1-.png?context=bWFzdGVyfHJvb3R8NzQ3MHxpbWFnZS9wbmd8aDljL2g2NS85MzAxMDI2NTA0NzM0LnBuZ3xjN2MyM2FmYjIzNWI5NjdlNDcxZDlmNzNiNjFiZGVhYjg5NTcxYjQ0Yjg3NTdmZmM4MzYwYmViMzUxMTY4Yjky" style="width: 56px; vertical-align: top;"></span>');
  }

  function addKlarnaPDP(price) {
    var productPlacement = '<klarna-placement data-key="credit-promotion-badge" data-locale="en-GB" data-purchase-amount="' + price + '"></klarna-placement>';
    $('.wishlistWrapper').before(productPlacement);
    refreshKlarna();
  }

  function addKlarnaCart(price) {
    var productPlacement = '<klarna-placement data-key="credit-promotion-badge" data-locale="en-GB" data-purchase-amount="' + price + '"></klarna-placement>';
    $('.col-xs-12.col-sm-6.col-md-6.col-md-offset-2 .cart-totals').after(productPlacement);
    $('.col-xs-12.col-sm-6.col-md-6.col-md-offset-2 .cart-totals').css('margin-bottom', '0');
    $('.col-xs-12.col-sm-6.col-md-6.col-md-offset-2 .cart-totals .well').css('margin-bottom', '0');
    refreshKlarna();
  }

//Run Strapline Animation on all Pages & Both Websites
    straplineAnimation();

  if (pageType == 'Wishlist') {
    $(function() {
      $('.btn-wishlist').off('click');
      $('.prod_wishlist_datalayer').attr('data-inwishlist', 'true');
      ACC["product"]["bindWishlist"]();
      listPageWishlist();
      refreshWishlist();
      $('.notInWishlist').hide();
    })
  }

  if (pageType == 'PLP') {
    listPageWishlist();
  }

  if (pageType == 'Cart') {
    //Basket Level Variables
    var basketSKUs = [];
    $('.item__quantity.hidden-xs.hidden-sm input[name="productCode"]').each(function(index) {
      basketSKUs.push($(this).val())
    });
    //Klarna
    if (klarnaCart === true) {
      var productPrice = $('.text-right.grand-total').text().trim().replace('£', '').replace('.', '');
      addKlarnaCart(productPrice);
    }
    //Toy Appeal
    var toyAppealBasket = dataLayer.find(x => x.event === 'toyAppeal').basketTagEnabled;
    if (toyAppealBasket === true) {
      toyAppealCart();
    }
    //Cart Page Carousel Tracking
    $(window).load(function() {
      $('.cartBottomContent.row .owl-item').on('click', function() {
        if ($(this).closest('.owl-carousel').attr('id') == 'the_entertainer_product_carousel_cart_carousel') {
          ga('send', 'event', 'Cart Page Carousel', 'FreshRelevance');
        } else {
          ga('send', 'event', 'Cart Page Carousel', 'Entertainer');
        }
      })
    });
    //C&C Threshold Tracking
    var thresholdMessage = $('.basketTotal-below-threshold').css('display')
    if (thresholdMessage != 'none') {
      ga('send', 'event', 'Click & Collect Threshold', $('.text-right.grand-total').text().trim().replace('£', ''));
    }
  }

  if (pageType == 'Payment') {
    //Gift Card Box
    $('.payByGivexForm .submit_givexBalanceCheck').click(function() {
      var intervalCheck = setInterval(checkGiftCardBox, 1000);

      function checkGiftCardBox() {
        var giftCardBorder = $('.payByGivexForm .subtotals .form-group.giftcardToPay .control input').attr('class');
        if (giftCardBorder === undefined) {
          clearInterval(intervalCheck);
          $('.payByGivexForm .subtotals .form-group.giftcardToPay .control input').addClass('form-control');
        } else {
          clearInterval(intervalCheck);
        }
      }
    })
  }

  if (pageType == 'PDP') {
    // Klarna
    if (klarnaPDP === true) {
      var productPrice = $('.product-details.top-details .price').text().trim().replace('£', '').replace('.', '');
      addKlarnaPDP(productPrice);
    }
    //Toy Appeal
    if (location.pathname.indexOf('537996') > -1) {
      var toyAppealEnabled = dataLayer.find(x => x.event === 'toyAppeal').enabled;
      if (toyAppealEnabled === true) {
        toyAppealPDP();
      }
    }

    $('.prod_wishlist').on('click', function() {
      var SKU = $('.prod_wishlist').children('.prod_wishlist_datalayer').data('productcode').toString();
      if ($('.prod_wishlist').children('.btn-wishlist').children('.inWishlist').css('display') == 'none') {
        if (localStorage.getItem('Wishlist') === null) {
          var wishlist = [];
          wishlist.push(SKU);
          localStorage.setItem('Wishlist', JSON.stringify(wishlist));
        } else {
          var wishlist = JSON.parse(localStorage.getItem('Wishlist'));
          wishlist.push(SKU);
          localStorage.setItem('Wishlist', JSON.stringify(wishlist));
        }
      } else {
        if (localStorage.getItem('Wishlist') != null) {
          var wishlist = JSON.parse(localStorage.getItem('Wishlist'));
          var index = wishlist.indexOf(SKU);
          if (index > -1) {
            wishlist.splice(index, 1);
            localStorage.setItem('Wishlist', JSON.stringify(wishlist));
          }
        }
      }
    })
  }




})
