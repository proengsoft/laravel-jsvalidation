<?php

namespace Proengsoft\JsValidation;

use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\ServiceProvider;
use Proengsoft\JsValidation;

class JsValidationServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     */
    public function boot()
    {
        $this->bootstrapConfigs();
        $this->bootstrapViews();
        $this->publishAssets();

    }

    /**
     * Register the application services.
     */
    public function register()
    {
        $this->registerValidationFactory();
        $this->registerJsValidator();
    }

    /**
     *  Register JsValidator Factory
     *
     */
    protected function registerJsValidator()
    {
        $this->app->bind('jsvalidator', function (Application $app) {

            $selector = Config::get('jsvalidation.form_selector');
            $view = Config::get('jsvalidation.view');

            $manager = new Manager($selector, $view);
            $validatorFactory = $app->make('Illuminate\Contracts\Validation\Factory');

            return new JsValidatorFactory($validatorFactory, $manager, $app);
        });

    }

    /**
     * Register the validation factory.
     *
     * @return void
     */
    protected function registerValidationFactory()
    {
        $this->app->singleton('validator', function ($app) {
            $validator = new Factory($app['translator'], $app);

            // The validation presence verifier is responsible for determining the existence
            // of values in a given data collection, typically a relational database or
            // other persistent data stores. And it is used to check for uniqueness.
            if (isset($app['validation.presence'])) {
                $validator->setPresenceVerifier($app['validation.presence']);
            }

            // The session manager is responsible to secure Ajax validations
            if (isset($app['session.store'])) {
                $validator->setSessionStore($app['session.store']);
            }

            $validator->setJsRemoteEnabled(!$app['config']->get('jsvalidation.disable_remote_validation'));

            return $validator;
        });
    }


    /**
     * Configure and publish views.
     */
    protected function bootstrapViews()
    {
        $viewPath = realpath(__DIR__.'/../resources/views');

        $this->loadViewsFrom($viewPath, 'jsvalidation');
        $this->publishes([
            $viewPath => $this->app['path.base'].'/resources/views/vendor/jsvalidation',
        ], 'views');
    }

    /**
     * Load and publishes configs.
     */
    protected function bootstrapConfigs()
    {
        $configFile = realpath(__DIR__.'/../config/jsvalidation.php');

        $this->mergeConfigFrom($configFile, 'jsvalidation');
        $this->publishes([$configFile => $this->app['path.config'].'/jsvalidation.php'], 'config');
    }

    /**
     * Publish public assets.
     */
    protected function publishAssets()
    {
        $this->publishes([
            realpath(__DIR__.'/../public') => $this->app['path.public'].'/vendor/jsvalidation',
        ], 'public');
    }
}
