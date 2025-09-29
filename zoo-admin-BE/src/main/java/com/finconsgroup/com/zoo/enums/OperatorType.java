package com.finconsgroup.com.zoo.enums;

public enum OperatorType {
    ZOOKEEPER("zookeeper"),
    VETERINARIAN("veterinarian"),
    SECURITY_GUARD("security guard");

    private final String operatorType;

    OperatorType(String operatorType) {
        this.operatorType = operatorType;
    }

    public String getOperatorType() {
        return operatorType;
    }
}
