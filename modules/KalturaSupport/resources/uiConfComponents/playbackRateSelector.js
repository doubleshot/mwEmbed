
/**
 * Enables a playback speed selector
 */
( function( mw, $ ) { "use strict";
	mw.addKalturaPlugin( 'playbackRateSelector', function( embedPlayer, callback ) {
		var prsPlugin = {
			'getConfig': function( attr ){
				return embedPlayer.getKalturaConfig('playbackRateSelector', attr );
			},
			'currentSpeed': embedPlayer.getKalturaConfig('playbackRateSelector', 'defaultSpeed'),
			'getMenu': function(){
				var $speedMenu = $('<ul id="playbackRateList" />');
				var speedSet = prsPlugin.getConfig( 'speeds' ).split( ',' );
				// Local function to closure the "source" variable scope:
				$.each( speedSet, function( inx, speedFloat ){
					var icon = ( prsPlugin.currentSpeed == speedFloat ) ? 'bullet' : 'radio-on';
					$speedMenu.append(
						$.getLineItem( speedFloat + 'x', icon,function(){
							var vid = embedPlayer.getPlayerElement();
							vid.playbackRate = speedFloat;
							prsPlugin.currentSpeed = speedFloat;
							prsPlugin.updateNewSpeed();
						})
					);
				})
				return $speedMenu;
			},
			'updateNewSpeed':function(){
				var speedSet = prsPlugin.getConfig( 'speeds' ).split( ',' );
				//reset speed icon of selected item
				$('#playbackRateList li .ui-icon-bullet').addClass('ui-icon-radio-on').removeClass('ui-icon-bullet');
					$.each( speedSet, function( inx, speedFloat ){
				});
				//update label
				embedPlayer.getInterface()
					.find( '.speed-switch' ).text( prsPlugin.currentSpeed + 'x' );
				// update menu
				embedPlayer.getInterface()
				.find( '.swMenuContainer').find('li').each(function(){
					var $icon = $(this).find('.ui-icon');
					$icon.removeClass( 'ui-icon-bullet' ).addClass( 'ui-icon-radio-on' );
					if( $(this).text() == prsPlugin.currentSpeed + 'x' ){
						$icon.removeClass('ui-icon-radio-on').addClass( 'ui-icon-bullet')
					}
				}) 
			},
			// set a specific speed (assuming it is in the pre-define list)
			'setSpecificSpeed':function(newSpeed){
				prsPlugin.currentSpeed = newSpeed;
				embedPlayer.getPlayerElement().playbackRate = prsPlugin.currentSpeed;
				prsPlugin.updateNewSpeed();

			},
			//faster or slower API 
			'setNextOrPrevSpeed':function(delta){
			var pluginConfig = prsPlugin.getConfig(); 
          	var menu = $('#playbackRateList');
			var currentSpeed = prsPlugin.currentSpeed;
			var speedSet = prsPlugin.getConfig( 'speeds' ).split( ',' );
			switch(delta){
				case 1:
					//find next speed 
					for (var i=0;i<speedSet.length;i++){
						if(currentSpeed == speedSet[i] && i<speedSet.length-1){
							prsPlugin.currentSpeed = speedSet[i+1];
							embedPlayer.getPlayerElement().playbackRate = prsPlugin.currentSpeed;
							prsPlugin.updateNewSpeed();
							return;
						}
					}
					break;
				case -1:
					//find previous speed
					for (var i=0;i<speedSet.length;i++){
						if(currentSpeed == speedSet[i] && i>0){
							prsPlugin.currentSpeed = speedSet[i-1];
							embedPlayer.getPlayerElement().playbackRate = prsPlugin.currentSpeed;
							prsPlugin.updateNewSpeed();
							return;
						}
					}
					break;
			}
			},
			'getSpeedTitle':function(){
				return prsPlugin.currentSpeed + 'x';
			},
			'component':{
				'w' : 50,
				'o' : function( ctrlObj ){
					var $menuContainer = $('<div />').addClass( 'swMenuContainer' ).hide();
					ctrlObj.embedPlayer.getInterface().append(
							$menuContainer
					)
					// Stream switching widget ( display the current selected stream text )
					return $( '<div />' )
						.addClass('ui-widget speed-switch')
						.css('height', ctrlObj.getHeight() )
						.append(
							prsPlugin.getSpeedTitle()
						).menu( {
							'content' : prsPlugin.getMenu(),
							'zindex' : mw.getConfig( 'EmbedPlayer.FullScreenZIndex' ) + 2,
							'keepPosition' : true,
							'targetMenuContainer' : $menuContainer,
							'width' : 160,
							'showSpeed': 0,
							'createMenuCallback' : function(){
								var $interface = ctrlObj.embedPlayer.getInterface();
								var $sw = $interface.find( '.speed-switch' );
								var $swMenuContainer = $interface.find('.swMenuContainer');
								var height = $swMenuContainer.find( 'li' ).length * 24;
								if( height > $interface.height() - 30 ){
									height = $interface.height() - 30;
								}
								// Position from top ( why we can't use bottom here )
								var top = $interface.height() - height - ctrlObj.getHeight() - 8;
								$menuContainer.css({
									'position' : 'absolute',
									'left': $sw[0].offsetLeft-30,
									'top' : top,
									'bottom': ctrlObj.getHeight(),
									'height' : height
								})
								ctrlObj.showControlBar( true );
							},
							'closeMenuCallback' : function(){
								ctrlObj.restoreControlsHover()
							}
						} );
				}
			}
		};
		// If the plugin is enabled add binding for controlbuilder append: 
		$(embedPlayer).bind('addControlBarComponent.playbackRateSelector', function(){
			embedPlayer.controlBuilder.supportedComponents[ 'playbackRateSelector' ] = true;
			embedPlayer.controlBuilder.components['playbackRateSelector'] = prsPlugin.component;
		});
		// API for this plugin. With this API any external plugin or JS code will be able to set 
		// the speed to be slower or faster than the current speed (from the given list)
		embedPlayer.bindHelper( 'setNextOrPrevSpeed', function( event, delta ) {
			prsPlugin.setNextOrPrevSpeed(delta);
		});
		// API for this plugin. With this API any external plugin or JS code will be able to set 
		// a specific speed, assuming the given speed is in the given list
		embedPlayer.bindHelper( 'setSpecificSpeed', function( event, newSpeed ) {
			prsPlugin.setSpecificSpeed(newSpeed);
		});
		callback();
	});

})( window.mw, window.jQuery );