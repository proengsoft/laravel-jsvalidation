<?php

namespace Isrenato\JsValidation\Support;

trait UseDelegatedValidatorTrait
{
    /**
     * Delegated validator.
     *
     * @var \Isrenato\JsValidation\Support\DelegatedValidator $validator
     */
    protected $validator;

    /**
     * Sets delegated Validator instance.
     *
     * @param \Isrenato\JsValidation\Support\DelegatedValidator $validator
     * @return void
     */
    public function setDelegatedValidator(DelegatedValidator $validator)
    {
        $this->validator = $validator;
    }

    /**
     * Gets current DelegatedValidator instance.
     *
     * @return \Isrenato\JsValidation\Support\DelegatedValidator
     */
    public function getDelegatedValidator()
    {
        return $this->validator;
    }
}
