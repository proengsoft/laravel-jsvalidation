<?php

namespace Proengsoft\JsValidation;

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Support\ServiceProvider;
use Proengsoft\JsValidation\Javascript\ValidatorHandler;

class JsValidationServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     */
    public function boot()
    {
        $this->bootstrapConfigs();
        $this->bootstrapViews();
        $this->bootstrapValidator();
        $this->publishAssets();

        if ($this->app['config']->get('jsvalidation.disable_remote_validation') === false) {
            $this->app[Kernel::class]->pushMiddleware(RemoteValidationMiddleware::class);
        }
    }

    /**
     * Register the application services.
     */
    public function register()
    {
        $this->app->singleton('jsvalidator', function ($app) {
            $config = $app['config']->get('jsvalidation');

            return new JsValidatorFactory($app, $config);
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
     *  Configure Laravel Validator.
     */
    protected function bootstrapValidator()
    {
        $callback = function () {
            return true;
        };
        $this->app['validator']->extend(ValidatorHandler::JSVALIDATION_DISABLE, $callback);
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
