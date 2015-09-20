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
        $this->app->singleton('jsvalidator.validator', function ($app)  {
            $currentValidator = $app['validator'];
            $validator = new Factory($currentValidator, $app);

            // The session manager is responsible to secure Ajax validations
            if (isset($app['session.store'])) {
                $validator->setSessionStore($app['session.store']);
            }

            $validator->setJsRemoteEnabled(!$app['config']->get('jsvalidation.disable_remote_validation'));

            return $validator;
        });

        $this->app->booting(function($app) {
            $app['validator']=$app['jsvalidator.validator'];
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
