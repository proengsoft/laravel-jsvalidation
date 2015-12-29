<?php

namespace Proengsoft\JsValidation\Support;

trait UseDelegatedValidatorTrait
{
    /**
     * Delegated validator.
     *
     * \Proengsoft\JsValidation\Support\DelegatedValidator $validator
     */
    protected $validator;

    /**
     * Sets delegated Validator instance.
     *
     * @param \Proengsoft\JsValidation\Support\DelegatedValidator $validator
     */
    public function setDelegatedValidator(DelegatedValidator $validator)
    {
        $this->validator = $validator;
    }

    /**
     *  Gets current DelegatedValidator instance.
     * @return \Proengsoft\JsValidation\Support\DelegatedValidator
     */
    public function getDelegatedValidator()
    {
        return $this->validator;
    }
}
