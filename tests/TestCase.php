<?php

namespace Proengsoft\JsValidation\Tests;

use Proengsoft\JsValidation\JsValidationServiceProvider;

abstract class TestCase extends \Orchestra\Testbench\TestCase
{
    /**
     * Get package providers.
     *
     * @param  \Illuminate\Foundation\Application  $app
     *
     * @return array
     */
    protected function getPackageProviders($app)
    {
        return [JsValidationServiceProvider::class];
    }
}