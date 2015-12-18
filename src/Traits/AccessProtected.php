<?php
namespace Proengsoft\JsValidation\Traits;


use Closure;

trait AccessProtected
{

    /**
     * Calls inaccessible validator method.
     *
     * @param $instance
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
     * Calls inaccessible validator method.
     *
     * @param $instance
     * @param $property
     * @return Closure
     */
    protected function getProtected($instance, $property)
    {
        $closure = Closure::bind( function ($property) {
            return $this->$property;
        }, $instance, $instance);
        return $closure($property);
    }

    /**
     * Calls inaccessible validator method.
     *
     * @param Object|Closure $instance
     * @param $method
     * @param $args
     * @return mixed
     */
    public function callProtected($instance, $method, $args=[])
    {
        if (!($instance instanceof Closure)) {
            $instance = $this->createProtectedCaller($instance);
        }

        return call_user_func($instance, $method, $args);
    }

}