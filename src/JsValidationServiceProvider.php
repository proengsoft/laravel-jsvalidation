<?php namespace Proengsoft\JsValidation;

use Illuminate\Support\ServiceProvider;
use Proengsoft\JsValidation;

class JsValidationServiceProvider extends ServiceProvider
{


    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        // First we bootstrap configurations
        $this->bootstrapConfigs();

        $this->bootstrapViews();
        $this->publishAssets();
        $this->bootstrapValidator();
    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton('jsvalidator', function ($app) {

            $validator=$app->make('Illuminate\Contracts\Validation\Factory');
            $defaultConfig=$app['config']->get('jsvalidation');

            return new Factory($validator, $defaultConfig);
        });
    }


    /**
     * Register Validator resolver
     */
    protected function bootstrapValidator()
    {
        $this->app['validator']->resolver(function ($translator, $data, $rules, $messages = array(), $customAttributes = array()) {
            return new Validator($translator, $data, $rules, $messages, $customAttributes);
        });
    }

    /**
     * Configure and publish views
     */
    protected function bootstrapViews()
    {
        $viewPath = __DIR__.'/../resources/views';

        $this->loadViewsFrom($viewPath, 'jsvalidation');
        $this->publishes([
            $viewPath => base_path('resources/views/vendor/jsvalidation'),
        ]);
    }

    /**
     * Load and publishes configs
     */
    protected function bootstrapConfigs()
    {
        $configFile = __DIR__ . '/../config/jsvalidation.php';

        $this->mergeConfigFrom($configFile, 'jsvalidation');
        $this->publishes([$configFile => config_path('jsvalidation.php')], 'config');
    }

    /**
     * Publish public assets
     */
    protected function publishAssets()
    {
        $this->publishes([
            __DIR__.'/../public' => public_path('vendor/jsvalidation'),
        ], 'public');
    }
}
