// weather-widget.js
(function() {
    'use strict';

    const CONFIG = {
        AB_TEST_KEY: 'nt_weather_ab',
        IMPRESSION_TRACKED_KEY: 'nt_weather_impression',
        WEATHER_CACHE_KEY: 'nt_weather_cache_v1',
        CACHE_TTL: 30 * 60 * 1000, // 30 minutes
        API_ENDPOINT: 'https://europe-west1-amigo-actions.cloudfunctions.net/recruitment-mock-weather-endpoint/forecast',
        ANALYTICS_ENDPOINT: 'https://your-analytics-service.com/collect',
        APP_ID: 'a2ef86c41a'
    };
const widgetStyle = `<style>
            .weather-current {
                width: 11rem;
                height: 13rem;
                padding: 0.5rem;
                background: white;
                border-radius: 16px;
                margin: 0 2rem;
                font-weight: 600;
                white-space: nowrap;
                text-align: center;
            } 
            .weather-forecast { 
                padding: 1rem;
                font-weight: 600;
            }
           
            .forecast-header {
                font-weight: 600;
                text-indent: 1rem;
                margin-bottom: 1rem;
            }
            
            .forecast-items {
                display: flex;
                flex-direction: row;
            }
             .forecast-item {
                width: 11rem;
                height: 13rem;
                padding: 0.5rem;
                background: white;
                border-radius: 16px;
                margin: 0 1rem;
                text-align: center;
                font-weight: 600;
            } 
            .accordion-item--expanded {
                padding: 1.5rem;
            }
            .accordion-item--expanded button {
                justify-content: flex-end;
                flex-direction: row-reverse;
                padding-bottom: 1.5rem;
            }
            .accordion-item-body--collapsed {
                height: 0;
                display: none;
            }
            .accordion-item--expanded button div.fNhssB {
                transform: rotate(180deg);
                padding-left: 1rem;
                padding-right: 0;
            }
            .accordion-item .jXclPw {
                min-width: 120rem
            }

            </style>`;
    class WeatherIntegration {
        constructor() {
            this.widgetId = 'nt-weather-widget';
            this.requiredElements = ['visitor-info-accordion', 'place-contact'];
            console.log("WeatherIntegration constructor called");
            
            this.injectStyles();
        }
        
        injectStyles() {
            document.head.insertAdjacentHTML("beforeend", widgetStyle);
            // if (!document.getElementById('nt-weather-styles')) {
            //  TODO: Render styles conditionally
            // }
        }
        async initialize() {
            console.log("WeatherIntegration initialize")
            // if (!this.checkPrerequisites()) return;

            // TODO: sample code, uncomment to enable AB testing splitting users in 2 groups - control and test
            // Group persisted across visits using browser storage
            // Tracks impressions and conversions
            
            // const testGroup = this.initializeABTest();
            // if (testGroup !== 'test') return;

            try {
                console.log('WeatherIntegration initialize try ');
                const coords = this.extractCoordinates();
                const weatherData = await this.getWeatherData(coords);
                this.createWeatherWidget(weatherData);
                this.setupAccordionBehavior()
                // this.setupAnalytics();
            } catch (error) {
                console.error('WeatherIntegration Weather widget failed:', error);
                this.createFallbackWidget();
            }
        }

        checkPrerequisites() {
            return this.requiredElements.every(id => document.getElementById(id));
        }

        initializeABTest() {
            let group = localStorage.getItem(CONFIG.AB_TEST_KEY);
            if (!group) {
                group = Math.random() < 0.5 ? 'control' : 'test';
                localStorage.setItem(CONFIG.AB_TEST_KEY, group);
            }
            return group;
        }
        
        extractCoordinates() {
            try {
                const mapLink = document.getElementById('propertyViewOnGoogleMaps_image');
                if (!mapLink) throw new Error('Map link not found');
                
                const url = new URL(mapLink.href);
                const destination = url.searchParams.get('destination');
                
                if (!destination) throw new Error('Destination parameter missing');
                
                const [lat, lon] = destination.split(',').map(Number);

                if (isNaN(lat) || isNaN(lon)) throw new Error('Invalid coordinates');
                
                console.log("WeatherIntegration extractCoordinates: lat, lon", lat, lon)
                
                return { lat, lon };
            } catch (error) {
                console.error('Coordinate extraction failed:', error);
                
                // Fallback coordinates
                return { lat: 27.987850, lon: 86.925026 };
            }
        }

        async getWeatherData(coords) {
            const cached = this.getCachedWeather();
            if (cached) return cached;
            console.log("WeatherIntegration getWeatherData")

            try {
                console.log("WeatherIntegration getWeatherData try")
                const url = new URL(CONFIG.API_ENDPOINT);
                url.searchParams.append('appid', CONFIG.APP_ID);
                url.searchParams.append('lat', coords.lat);
                url.searchParams.append('lon', coords.lon);

                const response = await fetch(url);
                if (!response.ok) throw new Error(`API Error: ${response.status}`);
                const data = await response.json();
                
                const parsedData = this.parseWeatherResponse(data);
                this.cacheWeather(parsedData);
                return parsedData;
            } catch (error) {
                console.log("WeatherIntegration getWeatherData error" + error);
                return this.createFallbackData();
            } finally {
                console.log("WeatherIntegration getWeatherData Done");
            }
        }

        parseWeatherResponse(data) {
            const current = data.list[0];
            return {
                temp: current.main.temp.toFixed(1),
                description: current.weather[0].description,
                icon: current.weather[0].icon,
                city: data.city.name,
                forecast: data.list.slice(0, 4).map(entry => ({
                    time: new Date(entry.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    temp: entry.main.temp.toFixed(1),
                    icon: entry.weather[0].icon,
                    pop: entry.pop * 100
                }))
            };
        }

        createWeatherWidget(data) {
            if (document.getElementById(this.widgetId)) return;
            const widgetHTML = `
                <li id="${this.widgetId}" 
                    class="AccordionItemstyle__AccordionItemWrapper-sc-zx14w3-1 Accordionstyle__StyledAccordionItem-sc-5agikf-0 NwcVf accordion-item " 
                    data-testid="weather-widget"
                    style="padding: 1.5rem;"
                    >
                    <h2 id="accordion-item-heading--current-weather" class="Typographystyle__HeadingLevel4-sc-86wkop-3 erqRvC SingleAccordionstyle__StyledHeading-sc-1i82miq-6 bZUtjF">
                      <button aria-expanded="true" aria-controls="accordion-item-body--current-weather" id="accordion-item-button--current-weather" data-testid="accordion-item-button--current-weather-widget-toggle" class="SingleAccordionstyle__AccordionButton-sc-1i82miq-3 gKzSXk" style="justify-content: flex-end; flex-direction: row-reverse;">
                            <span class="Typographystyle__HeadingLevel4-sc-86wkop-3 erqRvC SingleAccordionstyle__StyledHeading-sc-1i82miq-6 AccordionItemstyle__StyledAccordionItemHeading-sc-zx14w3-0 bZUtjF fcsAzv">
                                Current Weather
                            </span>
                            <div class="SingleAccordionstyle__StyledIconWrapper-sc-1i82miq-0 fNhssB"><span class="Iconstyle__SVGWrapper-sc-461blh-0 hJKaYd SingleAccordionstyle__StyledIcon-sc-1i82miq-1 FYAss" data-ui-icon-type="chevronDown">
                                <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="100%" height="100%">
                                    <g>
                                        <path d="M1.4,3.5L8,10.1l6.6-6.6L16,4.9l-7.3,7.3c-0.2,0.2-0.4,0.3-0.7,0.3c-0.3,0-0.5-0.1-0.7-0.3L0,4.9L1.4,3.5z"></path>
                                    </g>
                                </svg>
                            </div>
                        </button>
                    </h2>
                    <div aria-hidden="false" class="SingleAccordionstyle__AccordionBody-sc-1i82miq-4 accordion-item-body--collapsed">
                        <div>
                            <section class="Sectionstyle__StyledSection-sc-1rnt8u1-0 eigAqT">
                                <div class="Sectionstyle__Inner-sc-1rnt8u1-1 hopRYb">
                                    <div class="Sectionstyle__Content-sc-1rnt8u1-3">
                                        <div class="Gridstyle__Row-sc-sque-0 jXclPw nt-row">
                                            <div class="Gridstyle__Column-sc-sque-1 bToVUj nt-col nt-col-m12 nt-col-t6">
                                                <div class="weather-current">
                                                    <div class="weather-main">
                                                        <img src="https://openweathermap.org/img/wn/${data.icon}@2x.png" 
                                                             alt="${data.description}" 
                                                             class="weather-icon">
                                                        <div class="weather-temp">
                                                            <span class="temp-value">${data.temp}</span>
                                                            <span class="temp-unit">°C</span>
                                                        </div>
                                                    </div>
                                                    <div class="weather-description">${data.description}</div>
                                                </div>
                                                ${data.forecast.length > 0 ? `
                                                <div class="weather-forecast">
                                                    <div class="forecast-header">Next 12 Hours</div>
                                                    <div class="forecast-items">
                                                        ${data.forecast.map(entry => `
                                                            <div class="forecast-item">
                                                                <div class="forecast-time">${entry.time}</div>
                                                                <img src="https://openweathermap.org/img/wn/${entry.icon}@2x.png" 
                                                                     alt="Weather icon" 
                                                                     class="forecast-icon">
                                                                <div class="forecast-temp">${entry.temp}°C</div>
                                                                <div class="forecast-pop">${entry.pop}%</div>
                                                            </div>
                                                        `).join('')}
                                                    </div>
                                                </div>` : ''}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </li>
            `;

            const contactSection = document.getElementById('place-contact');
            contactSection.insertAdjacentHTML('beforebegin', widgetHTML);
        }

        setupAccordionBehavior() {
            // Event delegation for dynamically created element
            document.getElementById('accordion-item-heading--current-weather').addEventListener('click', (e) => {
                const heading = document.getElementById('accordion-item-heading--current-weather');
                console.log("accordion-item-heading clicked")
                if (!heading) return;
        
                const button = heading.querySelector('button');
                const parentElement = heading.parentElement;
                const itemBody = document.getElementById('nt-weather-widget').querySelector('.SingleAccordionstyle__AccordionBody-sc-1i82miq-4');
                const nextExpand = itemBody.classList.contains('accordion-item-body--expanded') ? false : true;

                // Toggle accordion state
                console.log("accordion-item-heading isExpanded", nextExpand);
                button.setAttribute('aria-expanded', nextExpand);
                parentElement.classList.toggle("eLpRXb",nextExpand === false);
                parentElement.classList.toggle("accordion-item--expanded",nextExpand === true);
                itemBody.setAttribute('aria-hidden', nextExpand);
                itemBody.classList.toggle("accordion-item-body--expanded", nextExpand === true);
                itemBody.classList.toggle("accordion-item-body--collapsed", nextExpand === false);
                console.log("accordion-item-heading updated", heading, parentElement, button, itemBody);
                
            });
        }


        // setupAnalytics() {
        //     if (!sessionStorage.getItem(CONFIG.IMPRESSION_TRACKED_KEY)) {
        //         navigator.sendBeacon(CONFIG.ANALYTICS_ENDPOINT, JSON.stringify({
        //             event: 'weather_impression',
        //             test_group: localStorage.getItem(CONFIG.AB_TEST_KEY),
        //             timestamp: Date.now()
        //         }));
        //         sessionStorage.setItem(CONFIG.IMPRESSION_TRACKED_KEY, 'true');
        //     }

        //     document.addEventListener('click', (e) => {
        //         if (e.target.closest('.visit-button')) {
        //             navigator.sendBeacon(CONFIG.ANALYTICS_ENDPOINT, JSON.stringify({
        //                 event: 'conversion',
        //                 test_group: localStorage.getItem(CONFIG.AB_TEST_KEY),
        //                 timestamp: Date.now()
        //             }));
        //         }
        //     });
        // }

        cacheWeather(data) {
            console.log("WeatherIntegration cacheWeather data" + data);
            localStorage.setItem(CONFIG.WEATHER_CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                data
            }));
        }

        getCachedWeather() {
            console.log("WeatherIntegration getCachedWeather");
            const cached = localStorage.getItem(CONFIG.WEATHER_CACHE_KEY);
            if (!cached) return null;
            console.log("WeatherIntegration getCachedWeather cached", cached);
            const { timestamp, data } = JSON.parse(cached);
            return (Date.now() - timestamp < CONFIG.CACHE_TTL) ? data : null;
        }

        createFallbackData() {
            console.log("WeatherIntegration createFallbackData",);
            return {
                temp: '18.5',
                description: "sunny",
                icon: "01d",
                city: "Local Area",
                forecast: []
            };
        }

        createFallbackWidget() {
            console.log("WeatherIntegration createFallbackWidget");
            const fallbackHTML = `
                <li class="weather-fallback">
                    <!-- Simple fallback message if needed -->
                </li>
            `;
            const contactSection = document.getElementById('place-contact');
            contactSection.insertAdjacentHTML('beforebegin', fallbackHTML);
        }
    }


    // new WeatherIntegration().initialize();
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new WeatherIntegration().initialize());
    } else {
        new WeatherIntegration().initialize();
    }
})();