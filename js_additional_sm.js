var SM = SM || {};
var pageType
var website
var paypal
var amazon
var klarnaFooter
var mobileDevice

SM.global = {
  autostart: ["addGlobalVars", "paypalAmazonUsers", "globalFunctions"],
  refreshKlarna: function() {
    window.KlarnaOnsiteService = window.KlarnaOnsiteService || [];
    window.KlarnaOnsiteService.push({
      eventName: 'refresh-placements'
    });
  },
  addGlobalVars: function() {
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
    } else if (window.location.pathname == '/my-account') {
      pageType = 'MyAccount'
    } else if ($('.page-presentFinder').length) {
      pageType = 'PresentFinder'
    }

    var isMobileWidth = $(window).width();
    var isMobileDevice = navigator.userAgent.match(/Android|BlackBerry|iPhone|Opera Mini|IEMobile/i);
    if (isMobileWidth < '455' && isMobileDevice.length > '0') {
      mobileDevice = 'Mobile'
    }

    if (location.hostname == 'www.thetoyshop.com') {
      website = 'ToyShop'
    } else {
      website = 'ELC'
    }

    paypal = $('#is-paypal-user').text();
    amazon = $('#is-amazon-user').text();
    klarnaFooter = dataLayer.find(x => x.event === 'klarnaVariables').klarnaFooter;
  },
  globalFunctions: function() {
    //Search Bar Autocorrect
    $('#js-site-search-input').attr('autocorrect', 'off');
    //Change Transition of Website Strapline
    $(".content .owl-wrapper").addClass("notransition");
    //Update Klarna T&Cs Page
    if (location.pathname == '/klarna') {
      SM.global.refreshKlarna();
    }
    //Add Klarna Footer
    if (klarnaFooter === true) {
      $('.footer__payments').prepend('<span><img src="/medias/Klarna-PaymentBadge-OutsideCheckout-Pink-1-.png?context=bWFzdGVyfHJvb3R8NzQ3MHxpbWFnZS9wbmd8aDljL2g2NS85MzAxMDI2NTA0NzM0LnBuZ3xjN2MyM2FmYjIzNWI5NjdlNDcxZDlmNzNiNjFiZGVhYjg5NTcxYjQ0Yjg3NTdmZmM4MzYwYmViMzUxMTY4Yjky" style="width: 56px; vertical-align: top;"></span>');
    }
  },
  paypalAmazonUsers: function() {
    if (paypal == "true" || amazon == "true") {
      $('.js-secondaryNavAccount .auto.col-md-4, .myAccountLinksContainer .auto').has('a[href="https://www.thetoyshop.com/my-account/birthday-club-children"]').css('display', 'none');
      if (pageType == 'MyAccount')
        $('.accountNav .yCmsComponent').has('a[href="/my-account/birthday-club-children"]').css('display', 'none');
      else if (window.location.pathname == '/my-account/birthday-club-children' || window.location.pathname == '/my-account/add-birthday-club-child') {
        window.location.replace("/my-account");
      }
    }
  }
}

SM.PLP = {
  autostart: ["listPageWishlist"],
  listPageWishlist: function() {
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
}

SM.Cart = {
  autostart: ["addBasketVariables", "addFindOutMoreActions", "updateBasket", "intDeliveryCart"],
  addBasketVariables: function() {
    var basketSKUs = [];
    $('.item__quantity.hidden-xs.hidden-sm input[name="productCode"]').each(function(index) {
      basketSKUs.push($(this).val())
    });
    var klarnaCart = dataLayer.find(x => x.event === 'klarnaVariables').klarnaCart;
    var productPrice = $('.text-right.grand-total').text().trim().replace('£', '').replace('.', '');
    var toyAppealBasket = dataLayer.find(x => x.event === 'toyAppeal').basketTagEnabled;
    SM.Cart.toyAppealCart(toyAppealBasket, basketSKUs);
    SM.Cart.klarnaCart(klarnaCart, productPrice);
  },
  intDeliveryCart: function() {
    var url = window.location.search
    if (url.indexOf('intdel') > -1) {
      var value = url.replace('?intdel&v=', '');
      $("<div class='global-alerts'><div class='alert alert-danger basketTotal-below-threshold'>SORRY, WE CAN NOT DELIVER ORDERS OVER £" + value + " TO THE COUNTRY YOU CHOSE.</div></div>").prependTo('.col-xs-12.col-sm-12.col-md-12')
    }
  },
  addFindOutMoreActions: function() {
    //Find out more click functions
    $(document).on({
      mouseenter: function() {
        $('#customPopupCollectInfo').fadeIn();
      },
      mouseleave: function() {
        $('#customPopupCollectInfo').fadeOut();
      }
    }, "#collectFindMore");
    $(document).on({
      mouseenter: function() {
        $('#customPopupHomeInfo').fadeIn();
      },
      mouseleave: function() {
        $('#customPopupHomeInfo').fadeOut();
      }
    }, "#homeFindMore");
  },
  updateBasketLayout: function(delTitle, strCollectMessage, strHomeMessage, intHomeDeliveryCharges, strCollectDeliveryCharges, thresholdMessage, homeDeliveryMessage, clickCollectMessage) {
    //Remove Continue Shopping Buttons
    $('.btn--continue-shopping').remove();
    //Add Gift Voucher Message below Promotion Box
    $('.cart-voucher').after('<div class="giftVoucher" style="font-size: 12px;">Got a gift voucher? You can enter it at the payment page</div>')
    $('.cartTopContent .row:eq(1)').before(delTitle)
    $('.addToCartdeliverySelect.collect').append(strCollectMessage);
    $('.addToCartdeliverySelect.home').append(strHomeMessage);
    $('.addToCartdeliverySelect.home .deliveryTitle').html($('.addToCartdeliverySelect.home .deliveryTitle').html().replace("Home Delivery", "<span class='homeDelivery customDeliveryTitle'>Home Delivery " + homeDeliveryMessage + "</span>"));
    $('.addToCartdeliverySelect.collect .deliveryTitle').html($('.addToCartdeliverySelect.collect .deliveryTitle').html().replace("Click &amp; Collect", "<span class='clickCollect customDeliveryTitle'>Click & Collect " + clickCollectMessage + "</span>"));
    $('.cart__deliverySelect .addToCartdeliverySelect.home .deliveryTitle').append('<span class="customDelPrice">' + intHomeDeliveryCharges + '</span>');
    $('.cart__deliverySelect .addToCartdeliverySelect.collect .deliveryTitle').append('<span class="customDelPrice">' + strCollectDeliveryCharges + '</span>');
    if (thresholdMessage != 'none') {
      ga('send', 'event', 'Click & Collect Threshold', $('.text-right.grand-total').text().trim().replace('£', ''));
    }
  },
  updateBasket: function() {
    var deliverySelected = $('#cartDeliveryMethod').val();
    var intBasketAmount = $('.mini-cart-price.js-mini-cart-price').text().replace(/[^0-9\.-]+/g, "");
    var deliveryThreshold = dataLayer.find(x => x.event === 'basketVariables').basketThreshold;
    var clickCollectThreshold = dataLayer.find(x => x.event === 'basketVariables').clickCollectThreshold;
    var deliveryCost = dataLayer.find(x => x.event === 'basketVariables').deliveryCost;
    var deliveryLeadTime = dataLayer.find(x => x.event === 'basketVariables').deliveryLeadTime;
    var clickCollectLeadTime = dataLayer.find(x => x.event === 'basketVariables').clickCollectLeadTime;
    var deliverySelected = $('#cartDeliveryMethod').val();
    var homeDeliveryAvailability = $('.bottomNotification.deliveryAvailable').text().trim();
    var clickCollectAvailability = $('.bottomNotification.collectNotAvailable').get(0).style.display;
    var delTitle = $('.cart-subhead:contains("Select Delivery")').closest('.col-xs-6.col-sm-6.col-md-4');
    var thresholdMessage = $('.basketTotal-below-threshold').css('display');
    var homeDeliveryMessage
    var clickCollectMessage
    var intHomeDeliveryCharges
    var strCollectDeliveryCharges

    if (homeDeliveryAvailability === 'Available') {
      strHomeMessage = '<div class="customHomeMoreInfoContainer"><p class="customTimeRequired">' + deliveryLeadTime + '</p><p class="customHomeFindMoreLink"><a id="homeFindMore"  class="basketFindOut">Find out more</a><p class="customPopupInfo" id="customPopupHomeInfo">Our standard delivery service is FREE when you spend £' + deliveryThreshold + ' or £' + deliveryCost + ' for orders under £' + deliveryThreshold + '. We deliver in ' + deliveryLeadTime + ' and offer faster delivery options at checkout.</p></p></div>';
    } else {
      strHomeMessage = '<div class="customHomeMoreInfoContainer"><p class="customTimeRequired"></p><p class="customHomeFindMoreLink"><a id="homeFindMore" class="basketFindOut">Find out why</a><p class="customPopupInfo" id="customPopupHomeInfo">Unfortunately home delivery is unavailable for your order.  1 or more items are not in stock at our fulfilment centre and only available in certain stores. Select our Click & Collect service to see if there is a store near you.</p></p></div>';
    }

    if (intBasketAmount < clickCollectThreshold) {
      strCollectDeliveryCharges = ''
      var intRemainAmount = clickCollectThreshold - intBasketAmount
      if (intRemainAmount % 1 != 0) {
        intRemainAmount = intRemainAmount.toFixed(2);
      }
      strCollectMessage = '<div class="customCollectMoreInfoContainer"><p class="customTimeRequired"> Spend £' + intRemainAmount + ' more to receive Free Click & Collect</p><p class="customCollectFindMoreLink"><a id="collectFindMore" class="basketFindOut displayDisable">Find out more</a><p class="customPopupInfo" id="customPopupCollectInfo">Our Click & Collect service is only available on orders over £' + clickCollectThreshold + '. Please select our home delivery service to checkout or continue shopping to check out using Click & Collect.</p></p></div>'
    } else {
      strCollectDeliveryCharges = 'FREE'
      strCollectMessage = '<div class="customCollectMoreInfoContainer"><p class="customTimeRequired"> From ' + clickCollectLeadTime + ' </p><p class="customCollectFindMoreLink"><a id="collectFindMore" class="basketFindOut displayDisable">How quick can I collect?</a><p class="customPopupInfo" id="customPopupCollectInfo">Our Click & Collect service is FREE when you spend £' + clickCollectThreshold + '.  Delivery takes from as little as ' + clickCollectLeadTime + ' depending on stock levels. We will break this down by item at checkout so you know exactly when you can collect your items.</p></p></div>'
    }
    if ($('.addToCartdeliverySelect.collect').hasClass('basketCollectPickerDisabled')) {
      strCollectDeliveryCharges = ''
      strCollectMessage = '<div class="customCollectMoreInfoContainer"><p class="customTimeRequired"></p><p class="customCollectFindMoreLink"><a id="collectFindMore" class="basketFindOut">Find out why</a><p class="customPopupInfo" id="customPopupCollectInfo">Unfortunately Click & Collect is unavailable for your order. 1 or more items are not eligible due to the items weight/size or availability in your chosen store. Please remove items highlighted in red or select our Home Delivery service.</p></p></div>'
    }

    if (intBasketAmount < parseInt(deliveryThreshold) && homeDeliveryAvailability === 'Available') {
      intHomeDeliveryCharges = '£' + deliveryCost;
    } else if (intBasketAmount >= parseInt(deliveryThreshold) && homeDeliveryAvailability === 'Available') {
      intHomeDeliveryCharges = 'Free';
    } else {
      intHomeDeliveryCharges = ''
    }

    //Home Delivery Message
    if (homeDeliveryAvailability === 'Available' && deliverySelected === 'home') {
      homeDeliveryMessage = 'Selected'
    } else if (homeDeliveryAvailability === 'Available' && deliverySelected === 'collect') {
      homeDeliveryMessage = 'Available'
    } else {
      homeDeliveryMessage = 'Unavailable'
      $('.addToCartdeliverySelect.home').addClass('basketCollectPickerDisabled');
    }

    //Click Collect Message
    if (clickCollectAvailability === 'none' && deliverySelected === 'collect') {
      clickCollectMessage = 'Selected'
    } else if (clickCollectAvailability === 'none' && deliverySelected === 'home') {
      clickCollectMessage = 'Available'
    } else {
      clickCollectMessage = 'Unavailable'
      $('.addToCartdeliverySelect.collect').addClass('basketCollectPickerDisabled');
    }

    SM.Cart.updateBasketLayout(delTitle, strCollectMessage, strHomeMessage, intHomeDeliveryCharges, strCollectDeliveryCharges, thresholdMessage, homeDeliveryMessage, clickCollectMessage);
  },
  toyAppealCart: function(toyAppealBasket, basketSKUs) {
    if (toyAppealBasket === true) {
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
  },
  klarnaCart: function(klarnaCart, productPrice) {
    if (klarnaCart === true) {
      var productPlacement = '<klarna-placement data-key="credit-promotion-badge" data-locale="en-GB" data-purchase-amount="' + productPrice + '"></klarna-placement>';
      $('.col-xs-12.col-sm-6.col-md-6.col-md-offset-2 .cart-totals').after(productPlacement);
      $('.col-xs-12.col-sm-6.col-md-6.col-md-offset-2 .cart-totals').css('margin-bottom', '0');
      $('.col-xs-12.col-sm-6.col-md-6.col-md-offset-2 .cart-totals .well').css('margin-bottom', '0');
      SM.global.refreshKlarna();
    }
  }
}

SM.PDP = {
  autostart: ["pdpVars", "pdpWishlist", "moveCrossSellSlot", "recentlyViewedFix", "updateDeliveryMessage", "deliveryLayoutChanges"],
  pdpVars: function() {
    var productPrice = $('.product-details.top-details .price').text().trim().replace('£', '').replace('.', '');
    var toyAppealEnabled = dataLayer.find(x => x.event === 'toyAppeal').enabled;
    var klarnaPDP = dataLayer.find(x => x.event === 'klarnaVariables').klarnaPDP;
    var homeDeliveryMessage
    var clickCollectMessage
    SM.PDP.addKlarnaPDP(klarnaPDP, productPrice);
    SM.PDP.toyAppealPDP(toyAppealEnabled);
    SM.PDP.onClickMessageChange(clickCollectMessage, homeDeliveryMessage);
    SM.PDP.deliveryLayoutChanges(clickCollectMessage, homeDeliveryMessage);
  },
  onClickMessageChange: function(clickCollectMessage, homeDeliveryMessage) {
    $('.addToCart__deliverySelect-option.collect').click(function() {
      if ($('.addToCart__deliverySelect-option.collect').hasClass('customDisabled')) {
        $('.addToCart__deliverySelect-option.home').addClass('selected');
        $('.addToCart__deliverySelect-option.home').trigger('click');
      } else {
        SM.PDP.updateDeliveryMessage();
        $('span.clickCollect.customDeliveryTitle').text("Click & Collect " + clickCollectMessage);
        $('span.homeDelivery.customDeliveryTitle').text("Home Delivery " + homeDeliveryMessage);
      }
    });
  },
  deliveryLayoutChanges: function(clickCollectMessage, homeDeliveryMessage) {
    //Find out more click functions
    $(document).on({
      mouseenter: function() {
        $('#customPopupCollectInfo').fadeIn();
      },
      mouseleave: function() {
        $('#customPopupCollectInfo').fadeOut();
      }
    }, "#collectFindMore");
    $(document).on({
      mouseenter: function() {
        $('#customPopupHomeInfo').fadeIn();
      },
      mouseleave: function() {
        $('#customPopupHomeInfo').fadeOut();
      }
    }, "#homeFindMore");

    //Add Radio Buttons to Delivery Icons
    if ($('.homeOptionPDP').length === 0) {
      $('<div class="custRadio homeOptionPDP"></div>').insertAfter('.PDP-Right .addToCart__deliverySelect-option.home .deliveryTitle .addToCart__deliverySelect-option-radio');
    }
    if ($('.ccOptionPDP').length === 0) {
      $('<div class="custRadio ccOptionPDP"></div>').insertAfter('.PDP-Right .addToCart__deliverySelect-option.collect .deliveryTitle .addToCart__deliverySelect-option-radio');
    }

    $('.addToCart__deliverySelect-option.home .deliveryTitle').html($('.addToCart__deliverySelect-option.home .deliveryTitle').html().replace("Home Delivery", "<span class='homeDelivery customDeliveryTitle'>Home Delivery " + homeDeliveryMessage + "</span>"));
    $('.addToCart__deliverySelect-option.collect .deliveryTitle').html($('.addToCart__deliverySelect-option.collect .deliveryTitle').html().replace("Click &amp; Collect", "<span class='clickCollect customDeliveryTitle'>Click & Collect " + clickCollectMessage + "</span>"));
  },
  homeDeliveryMessage: function(homeDeliverySelected, homeDeliveryAvailability) {
    if (homeDeliveryAvailability === 'In Stock' && homeDeliverySelected === true) {
      homeDeliveryMessage = 'Selected'
    } else if (homeDeliveryAvailability === 'In Stock' && homeDeliverySelected === false) {
      homeDeliveryMessage = 'Available'
    } else {
      homeDeliveryMessage = 'Unavailable'
      $('.addToCart__deliverySelect-option.home').addClass('customDisabled');
      $('.addToCart__deliverySelect-option.home').append($('.customHomeStatusContainer'));
      $('.customHomeStatusContainer').css('display', 'block');
    }
  },
  collectMessage: function(clickCollectAvailability, clickCollectSelected) {
    if (clickCollectAvailability === 'none' && clickCollectSelected === true) {
      clickCollectMessage = 'Selected'
    } else if (clickCollectAvailability === 'none' && clickCollectSelected === false) {
      clickCollectMessage = 'Available'
    } else {
      clickCollectMessage = 'Unavailable'
      $('.addToCart__deliverySelect-option.collect').addClass('customDisabled');
      $('.addToCart__deliverySelect-option.collect').append($('.customCollectStatusContainer'));
      $('.customCollectStatusContainer').css('display', 'block');
    }
  },
  updateDeliveryMessage: function() {
    var homeDeliverySelected = $('.addToCart__deliverySelect-option.home').hasClass('selected')
    var clickCollectSelected = $('.addToCart__deliverySelect-option.collect').hasClass('selected')
    var homeDeliveryAvailability = $('.addToCart__deliverySelect-option.home .deliveryAvailable').text().trim();
    var clickCollectAvailability = jQuery('.addToCart__deliverySelect-option.collect .collectNotAvailable').get(0).style.display;
    //Home Delivery Message
    SM.PDP.homeDeliveryMessage(homeDeliverySelected, homeDeliveryAvailability);
    //Click Collect Message
    SM.PDP.collectMessage(clickCollectAvailability, clickCollectSelected);
  },
  addKlarnaPDP: function(klarnaPDP, productPrice) {
    if (klarnaPDP === true) {
      var productPlacement = '<klarna-placement data-key="credit-promotion-badge" data-locale="en-GB" data-purchase-amount="' + productPrice + '"></klarna-placement>';
      $('.wishlistWrapper').before(productPlacement);
      SM.global.refreshKlarna();
    }
  },
  recentlyViewedFix: function() {
    if ($('.carousel-component.recently-viewed .owl-item').length == 1) {
      $('.carousel-component.recently-viewed').css('display', 'none');
      $('.reviewsWrapper').css('padding-bottom', '221px');
    } else {
      $('.carousel-component.recently-viewed .owl-item').eq(0).css('display', 'none');
    }
  },
  moveCrossSellSlot: function() {
    if (mobileDevice == 'Mobile') {
      $(".page-productDetails .yCmsContentSlot.productDetailsPageSectionUpSelling").detach().insertBefore(".page-productDetails .tabs.js-tabs.tabs-responsive");
      $(".page-productDetails .yCmsContentSlot.productDetailsPageSectionUpSelling").addClass("customshift");
      $(".customshift .carousel-component").css('padding-bottom', '0');
    }
    if (mobileDevice == 'Mobile' && website == 'ToyShop') {
      $(".customshift .carousel-component").css('background-image', 'url(/medias/Carousel-Background.png?context=bWFzdGVyfHJvb3R8MTc5ODV8aW1hZ2UvcG5nfGg2ZS9oNDcvOTE5NDUyNTcyMDYwNi5wbmd8N2E0ZDU3YjRhODFkYmZiZDkzNzc4NDMxNWNhMWQ4NmMzMjg0YzRjMDkzYzgzZDBkMzdjNzY3OWI2ZWQ2YjliMQ)');
    }
  },
  toyAppealPDP: function(toyAppealEnabled) {
    if (location.pathname.indexOf('537996') > -1 && toyAppealEnabled === true) {
      $('.taSteps').appendTo('.col-sm-12.col-md-7.col-lg-6');
      $('.taSteps').css('display', 'block');
      $('.taDesc').appendTo('.col-md-6.col-md-offset-3.col-lg-6.col-lg-offset-3:eq(0) .tabbody');
      $('.taDesc').css('display', 'block');
      $('.col-md-6.col-md-offset-3.col-lg-6.col-lg-offset-3:eq(0) .tabbody').css('padding', '0');
    }
  },
  pdpWishlist: function() {
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
}

SM.Wishlist = {
  autostart: ["wishlistRefresh"],
  refreshWishlist: function() {
    var wishlist = []
    $('.prod_wishlist_datalayer').each(function() {
      var SKU = $(this).data('productcode').toString();
      wishlist.push(SKU)
    })
    localStorage.setItem('Wishlist', JSON.stringify(wishlist));
  },
  listPageWishlist: function() {
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
  },
  wishlistRefresh: function() {
    $('.btn-wishlist').off('click');
    $('.prod_wishlist_datalayer').attr('data-inwishlist', 'true');
    ACC["product"]["bindWishlist"]();
    SM.Wishlist.listPageWishlist();
    SM.Wishlist.refreshWishlist();
    $('.notInWishlist').hide();
  }
}

SM.PresentFinder = {
  autostart: ["removeGB"],
  removeGB: function() {
    //Present Finder - Remove Gender
    $(".clear.radio_holder ul").remove();
    $(".clear.radio_holder h3 label").remove();
  }
}

SM.Payment = {
  autostart: ["giftCardFix", "expiryDropdownFix"],
  giftCardFix: $('.payByGivexForm .submit_givexBalanceCheck').click(function() {
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
  }),
  expiryDropdownFix: function() {
    $('#cardDate').find('.nice-select').remove();
    $('.nice-select.card_type').remove();
    $('#ExpiryMonth, #ExpiryYear, select.card_type').css({
      'display': 'block',
      'visibility': 'visible'
    });
  }
}

function autostart(name) {
  $.each(SM, function(section, obj) {
    $.each(obj.autostart, function(key, value) {
      if (name == section) {
        SM[section][value]();
        console.log(section + ' ' + value)
      }
    })
  })
}

autostart('global')

if (pageType != undefined) {
  autostart(pageType)
}
