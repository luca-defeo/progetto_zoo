package com.finconsgroup.com.zoo.enums;

public enum TicketUrgency {
    BASSO("basso"),
    MEDIO("medio"),
    ALTO("alto");

    private final String TicketUrgency;

    TicketUrgency(String TicketUrgency) {this.TicketUrgency = TicketUrgency;}

    public String getTicketUrgency() {return TicketUrgency;}
}
