<?php

namespace Proengsoft\JsValidation\Support;

use Closure;

trait AccessProtectedTrait
{
    /**
     * Create closure to call inaccessible method.
     *
     * @param $instance
     *
     * @return Closure
     */
    protected function createProtectedCaller($instance)
    {
        return Closure::bind(function ($method, $args) {
            $callable = array($this, $method);

            return call_user_func_array($callable, $args);
        }, $instance, $instance);
    }

    /**
     * Gets inaccessible property.
     *
     * @param $instance
     * @param $property
     *
     * @return Closure
     */
    protected function getProtected($instance, $property)
    {
        $closure = Closure::bind(function ($property) {
            return $this->$property;
        }, $instance, $instance);

        return $closure($property);
    }

    /**
     * Calls inaccessible method.
     *
     * @param object|Closure $instance
     * @param $method
     * @param $args
     *
     * @return mixed
     */
    protected function callProtected($instance, $method, $args = [])
    {
        if (! ($instance instanceof Closure)) {
            $instance = $this->createProtectedCaller($instance);
        }

        return call_user_func($instance, $method, $args);
    }
}
